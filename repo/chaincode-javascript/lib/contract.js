'use strict';
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    // Funcion para crear usuario
    async createParticipant(ctx, participantId, name, email, role) {
        const participant = {
            participantId: participantId,
            name: name,
            email: email,
            role: role,
            projects: []
        };
        await ctx.stub.putState(participantId, Buffer.from(JSON.stringify(participant)));
    }

    // Funcion para crear proyecto

    async createProject(ctx, projectId, name, startDate, endDate, investments, assets, contributors, validators) {
        const project = {
            projectId: projectId,
            name: name,
            startDate: startDate,
            endDate: endDate,
            investments: investments,
            assets: assets,
            contributors: contributors,
            validators: validators
        };
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
    }

    // Funcion para crear interaccion en proyecto
    async createProjectInteraction(ctx, projectId, participantId, investment) {
        const participantBuffer = await ctx.stub.getState(participantId);
        if (!participantBuffer || participantBuffer.length === 0) {
            throw new Error(`Participant ${participantId} does not exist`);
        }
        const participant = JSON.parse(participantBuffer.toString());
        if (!participant.projects.includes(projectId)) {
            throw new Error(`Participant ${participantId} is not associated with project ${projectId}`);
        }
        const projectBuffer = await ctx.stub.getState(projectId);
        if (!projectBuffer || projectBuffer.length === 0) {
            throw new Error(`Project ${projectId} does not exist`);
        }
        const project = JSON.parse(projectBuffer.toString());
        if (!project.validators.includes(participantId)) {
            throw new Error(`Participant ${participantId} is not a validator for project ${projectId}`);
        }
        project.investments.push(investment);
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
    }

    // Crear interaccion uno a uno 
    async createUniqueInteraction(ctx, participantId1, participantId2, interaction) {
        const participant1Buffer = await ctx.stub.getState(participantId1);
        if (!participant1Buffer || participant1Buffer.length === 0) {
            throw new Error(`Participant ${participantId1} does not exist`);
        }
        const participant2Buffer = await ctx.stub.getState(participantId2);
        if (!participant2Buffer || participant2Buffer.length === 0) {
            throw new Error(`Participant ${participantId2} does not exist`);
        }
        const participant1 = JSON.parse(participant1Buffer.toString());
        const participant2 = JSON.parse(participant2Buffer.toString());
        participant1.interactions.push(interaction);
        participant2.interactions.push(interaction);
        await ctx.stub.putState(participantId1, Buffer.from(JSON.stringify(participant1)));
        await ctx.stub.putState(participantId2, Buffer.from(JSON.stringify(participant2)));
    }

    // Validar transaccion
    async validateInteraction(ctx, participantId, interactionId) {
        const participantBuffer = await ctx.stub.getState(participantId);
        if (!participantBuffer || participantBuffer.length === 0) {
            throw new Error(`Participant ${participantId} does not exist`);
        }
        const participant = JSON.parse(participantBuffer.toString());
        if (!participant.interactions.includes(interactionId)) {
            throw new Error(`Participant ${participantId} is not associated with interaction ${interactionId}`);
        }
        // Perform validation logic here
    }

    // Omitir, son funciones para consultar data
    
    async getAllProjects(ctx) {
        const startKey = '';
        const endKey = '';
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const results = [];
        while (true) {
            const queryResponse = await resultsIterator.next();
            if (queryResponse.value && queryResponse.value.value.toString()) {
                const result = {
                    key: queryResponse.value.key,
                    project: JSON.parse(queryResponse.value.value.toString())
                };
                results.push(result);
            }
            if (queryResponse.done) {
                await resultsIterator.close();
                return JSON.stringify(results);
            }
        }
    }
    
    async getAllParticipants(ctx) {
        const startKey = '';
        const endKey = '';
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const results = [];
        while (true) {
            const queryResponse = await resultsIterator.next();
            if (queryResponse.value && queryResponse.value.value.toString()) {
                const result = {
                    key: queryResponse.value.key,
                    participant: JSON.parse(queryResponse.value.value.toString())
                };
                results.push(result);
            }
            if (queryResponse.done) {
                await resultsIterator.close();
                return JSON.stringify(results);
            }
        }
    }
    
    async getAllInteractions(ctx) {
        const startKey = '';
        const endKey = '';
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const results = [];
        while (true) {
            const queryResponse = await resultsIterator.next();
            if (queryResponse.value && queryResponse.value.value.toString()) {
                const result = {
                    key: queryResponse.value.key,
                    interaction: JSON.parse(queryResponse.value.value.toString())
                };
                results.push(result);
            }
            if (queryResponse.done) {
                await resultsIterator.close();
                return JSON.stringify(results);
            }
        }
    }

    async getUser(ctx, userId) {
        const userKey = ctx.stub.createCompositeKey('User', [userId]);
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        return JSON.stringify(user);
    }

    async getAllUsers(ctx) {
        const startKey = 'User0';
        const endKey = 'User999999999';
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const results = [];
        while (true) {
            const queryResponse = await resultsIterator.next();
            if (queryResponse.value && queryResponse.value.value.toString()) {
                const result = {
                    key: queryResponse.value.key,
                    user: JSON.parse(queryResponse.value.value.toString())
                };
                results.push(result);
            }
            if (queryResponse.done) {
                await resultsIterator.close();
                return JSON.stringify(results);
            }
        }
    }
    
}

module.exports = AssetTransfer;