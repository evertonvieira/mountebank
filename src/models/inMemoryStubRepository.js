'use strict';

const Stub = {
    create: function (config) {
        function repeatsFor (response) {
            if (response._behaviors && response._behaviors.repeat) {
                return response._behaviors.repeat;
            }
            else {
                return 1;
            }
        }

        function repeatTransform (responses) {
            const result = [];
            let response, repeats;

            for (let i = 0; i < responses.length; i += 1) {
                response = responses[i];
                repeats = repeatsFor(response);
                for (let j = 0; j < repeats; j += 1) {
                    result.push(response);
                }
            }
            return result;
        }

        const helpers = require('../util/helpers'),
            stub = helpers.clone(config || {});

        stub.responses = stub.responses || [{ is: {} }];

        const statefulResponses = repeatTransform(stub.responses);

        stub.addResponse = response => { stub.responses.push(response); };

        stub.nextResponse = () => {
            const responseConfig = statefulResponses.shift(),
                Response = require('./response');

            statefulResponses.push(responseConfig);
            return Response.create(responseConfig, stub);
        };

        stub.deleteResponsesMatching = filter => {
            stub.responses = stub.responses.filter(response => !filter(response));
        };

        return stub;
    }
};

function create () {
    const stubs = []; // eslint-disable-line no-underscore-dangle

    function first (filter) {
        return stubs.find(filter);
    }

    function add (stub) {
        stubs.push(Stub.create(stub));
    }

    function insertBefore (stub, filter) {
        for (var i = 0; i < stubs.length; i += 1) {
            if (filter(stubs[i])) {
                break;
            }
        }
        stubs.splice(i, 0, Stub.create(stub));
    }

    function insertAtIndex (stub, index) {
        stubs.splice(index, 0, Stub.create(stub));
    }

    function overwriteAll (newStubs) {
        while (stubs.length > 0) {
            stubs.pop();
        }
        newStubs.forEach(stub => add(stub));
    }

    function overwriteAtIndex (newStub, index) {
        stubs[index] = Stub.create(newStub);
    }

    function deleteAtIndex (index) {
        stubs.splice(index, 1);
    }

    function getAll () {
        const helpers = require('../util/helpers'),
            result = helpers.clone(stubs);

        for (var i = 0; i < stubs.length; i += 1) {
            const realStub = stubs[i],
                exposedStub = result[i];

            // Proxy cloned functions to underlying object
            exposedStub.addResponse = realStub.addResponse;
            exposedStub.deleteResponsesMatching = filter => {
                realStub.deleteResponsesMatching(filter);
                exposedStub.responses = realStub.responses;
            };
        }
        return result;
    }

    return {
        count: () => stubs.length,
        first,
        add,
        insertBefore,
        insertAtIndex,
        overwriteAll,
        overwriteAtIndex,
        deleteAtIndex,
        getAll,
        newStub: Stub.create
    };
}

module.exports = { create };
