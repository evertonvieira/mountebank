'use strict';

/**
 * An abstraction for loading imposters from in-memory
 * @module
 */

/**
 * Creates the repository
 * @param {Object} config - The database configuration
 * @param {String} config.datadir - The database directory
 * @param {Number} config.batchSize - number of stubs to save in one file, defaults to 100
 * @returns {Object}
 */
// TODO: Make async to collect permission errors
function create (config) {

    function ensureDir (filepath) {
        // Node 11 introduced a recursive flag for mkdir, can use that when node 10 and below are deprecated
        const path = require('path'),
            fs = require('fs'),
            dir = path.dirname(filepath);

        if (fs.existsSync(dir)) {
            return;
        }
        else {
            ensureDir(dir);
            fs.mkdirSync(dir);
        }
    }

    function writeFile (filepath, obj) {
        const fs = require('fs'),
            path = require('path'),
            fullPath = path.join(config.datadir, filepath);

        ensureDir(fullPath);
        fs.writeFileSync(fullPath, JSON.stringify(obj));
    }

    function writeHeader (imposter) {
        const helpers = require('../util/helpers'),
            clone = helpers.clone(imposter);

        delete clone.stubs;
        delete clone.requests;

        writeFile(`${imposter.port}.json`, clone);
    }

    function writeResponses (responseDir, stubResponses) {
        const responsesIndex = { next: 0, order: [] };

        if (stubResponses.length === 0) {
            return;
        }

        stubResponses.forEach((response, index) => {
            writeFile(`${responseDir}/${index}.json`, response);
            responsesIndex.order.push(index);
        });

        writeFile(`${responseDir}/index.json`, responsesIndex);
    }

    function writeStubs (imposter) {
        const helpers = require('../util/helpers'),
            stubs = helpers.clone(imposter.stubs || []);

        if (stubs.length === 0) {
            return;
        }

        stubs.forEach((stub, index) => {
            stub.responseDir = `${imposter.port}/stubs/${index}`;
            writeResponses(stub.responseDir, stub.responses || []);
            delete stub.responses;
        });

        writeFile(`${imposter.port}/stubs/0-99.json`, stubs);
    }

    /**
     * Adds a new imposter
     * @param {Object} imposter - the imposter to add
     */
    function add (imposter) {
        writeHeader(imposter);
        writeStubs(imposter);
    }

    /**
     * Gets the JSON for all imposters
     * @param {Object} queryOptions - the query parameters for formatting
     * @returns {Object} - the JSON representation
     */
    function getAllJSON (queryOptions) { // eslint-disable-line no-unused-vars
        return null;
    }

    /**
     * Gets the imposter by id
     * @param {Number} id - the id of the imposter (e.g. the port)
     * @returns {Object} - the imposter
     */
    function get (id) { // eslint-disable-line no-unused-vars
        return null;
    }

    /**
     * Gets all imposters
     * @returns {Object} - all imposters keyed by port
     */
    function getAll () {
        return null;
    }

    /**
     * Returns whether an imposter at the given id exists or not
     * @param {Number} id - the id (e.g. the port)
     * @returns {boolean}
     */
    function exists (id) { // eslint-disable-line no-unused-vars
        return false;
    }

    /**
     * Deletes the imnposter at the given id
     * @param {Number} id - the id (e.g. the port)
     * @returns {Object} - the deletion promise
     */
    function del (id) { // eslint-disable-line no-unused-vars
        return null;
    }

    /**
     * Deletes all imposters synchronously; used during shutdown
     */
    function deleteAllSync () {
    }

    /**
     * Deletes all imposters
     * @returns {Object} - the deletion promise
     */
    function deleteAll () {
        return null;
    }

    return {
        add,
        get,
        getAll,
        getAllJSON,
        exists,
        del,
        deleteAllSync,
        deleteAll
    };
}

module.exports = { create };
