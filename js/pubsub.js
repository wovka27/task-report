export default class PubSub {
    constructor() {
        this.list = {};
    }

    /**
     * @param {string} event
     * @param {function} callback
     * @returns {number} A count of callbacks for this event
     * @memberof PubSub
     */
    subscribe(event, callback) {
        let self = this;

        if (!self.list.hasOwnProperty(event)) {
            self.list[event] = [];
        }

        return self.list[event].push(callback);
    }

    /**
     * @param {string} event
     * @param {object} [data={}]
     * @returns {array} The callbacks for this event, or an empty array if no event exits
     * @memberof PubSub
     */
    publish(event, data = {}) {
        let self = this;

        if (!self.list.hasOwnProperty(event)) {
            return [];
        }

        return self.list[event].map(callback => callback(data));
    }
}
