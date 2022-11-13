import PubSub from './pubsub.js';
import {camelCase} from "./helpers.js";

export default class Store {
    constructor(params) {
        this.state = {};
        this.status = 'store init';
        this.events = new PubSub();
        this.mutations = params.mutations;
        this.state = new Proxy((params.state || {}), this.proxy());
    }

    changeStatus(status) {
        this.status = status
    };

    proxy() {
        let self = this
        return {
            set: function(target, property, value, receiver) {
                // console.log(target, property, value, receiver)
                if (JSON.stringify(target[property]) === JSON.stringify(value)) return true

                if(self.status !== 'mutation') {
                    console.warn(
                        `Denied manual assignment of a value for ${property} in ${JSON.stringify(target)}\n `+
                        `You should use a mutation to set the value!`
                    );
                    return true
                }

                //console.log(camelCase("change " + property), property, value)

                target[property] = value;
                self.events.publish("changeState", self.state);
                self.events.publish(camelCase("change " + property), self.state);
                self.changeStatus('resting')

                return true;
            },
            get(target, property, receiver) {
                if (property === "isProxy" || property === "toJSON") return true

                const prop = target[property]

                if(typeof prop == 'undefined') return

                if (!prop["isProxy"] && typeof prop === "object" && !(prop instanceof HTMLElement) ) {
                    target[property] = new Proxy(prop, self.proxy());
                }

                return target[property]
            }
        }
    }

    /**
     * @param actionKey
     * @param {any} payload
     * @returns {boolean}
     * @memberof Store
     */
    dispatch(actionKey, payload) {
        this.changeStatus('action')
        this.commit(actionKey, payload)
        return true;
    }

    /**
     * @param {string} mutationKey
     * @param {any} payload
     * @returns {boolean}
     * @memberof Store
     */
    commit(mutationKey, payload) {
        if(typeof this.mutations[mutationKey] !== 'function') {
            console.warn(`Mutation "${mutationKey}" doesn't exist`);
            return false;
        }

        this.changeStatus('mutation')

        let mutationState = this.mutations[mutationKey](this.state, payload)
        this.state = Object.assign(this.state, mutationState);

        return true;
    }
}
