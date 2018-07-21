/**
 * The types listed below are used by the ticApi.
 * @module types
 * @typicalname types
 * @alias types
 * @name types
 */
;

/**
 * An Object containing the master MAM client and MAM clients for the profiles channel. With this object
 * all requests regarding a specific TIC account can be handled.
 * @typedef {Object} TICClient
 * @property {MAMClient} masterClient The MAMClient for the master channel.
 * @property {string} masterRoot The channel root of the master channel.
 * @property {Object} channelClients The MAMClients for the accounts channels.
 * @property {MAMClient} channelClients.profile The MAMClient for the profile channel.
 * @property {MAMClient} channelClients.contacts The MAMClient for the contacts channel.
 */
;

function b() {
    //workaround to prevent TICClient appearing twice in the readme.
};

/**
 * An object containing information about a contact.
 * @typedef {Object} Contact
 * @property {string} masterRoot the channel root of the master channel of the contact.
 * @property {Array.<Contact>} contacts the contacts of the contact.
 * @property {Number} depth the highest layer of the graph, created by a {@link module:types.RatingSearchResult},
 * where the contact exists.
 * @property {string} rating the rating (trust, distrust or unknown) that the contact gave the target of a
 * {@link module:types.RatingSearchResult}
 */
class Contact {
    constructor(masterRoot) {
        this.masterRoot = masterRoot;
        this.contacts = [];
    }
};

/**
 * An Object consisting of numbers representing the amounts of contacts rating a specific account 'trusted', 
 * 'distrusted' or 'unknown'. These numbers can be computed by specific measures (see {@link module:types.RatingSearchResult}).
 * @typedef {Object} Rating
 * @property {number} trust a number representing the amount of contacts rating a given account trustworthy.
 * @property {number} distrust a number representing the amount of contacts rating a given account not trustworthy.
 * @property {number} unknown a number representing the amount of contacts not rating a given a account.
 */
;

/**
 * An object containing both the {@link module:types.Rating} for a given contact computed by 
 * multiple measures and the  {@link module:types.Contact}s visited
 * recursivly in the search to derive it.
 * @typedef {Object} RatingSearchResult
 * @property {Contact} graph The paths of the rating searches source account to the {@link module:types.Contact}s, 
 * created while computing the rating for a given account, in form of a graph with a single root. The root is the account 
 * from where the search started (source account). The graph may contain cycles, so printing it may cause infinite loops. 
 * The children of a node in the graph are the accounts that are trusted by the contacts and the target of the rating search, 
 * even if they declared it as distrusting.
 * @property {Object} contacts An object containg all visited contacts. The keys are 
 * the master channel roots of the contacts. Their values are the {@link module:types.Contact}s themself. A contact is only visited 
 * if it's trusted. Additionally this property includes the target of the RatingSearch as a {@link module:types.Contact}.
 * @property {Array.<Contact>} visited an array containing all visited {@link module:types.Contact}s and 
 * the target.
 * @property {Object} rating An object containing {@link module:types.Rating}s derived with different measures.
 * @property {Rating} rating.flat a {@link module:types.Rating} computed by considering all visited contacts
 * equally.
 * @property {Rating} rating.weighted A {@link module:types.Rating} where the value of a rating is 
 * weighted by the lowest depth where it was found in the graph. the root has depth 0. The rating is weighted by 
 * 'rating / (depth + 1)'.
 * @property {Array.<Rating>} rating.perLevel An array of {@link module:types.Rating}s, one for each
 * layer of the graph. The nth element in the array contains the rating of all contacts at depth n.
 */
;

function c() {
    //workaround to prevent RatingSearchResult appearing twice in the readme.
};

const types = Contact

module.exports = types