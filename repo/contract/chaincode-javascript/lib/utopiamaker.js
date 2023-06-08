/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';



const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');


async function readState(ctx, id) {
	const assetBuffer = await ctx.stub.getState(id);
	if (!assetBuffer || assetBuffer.length === 0) {
		throw new Error(`The asset ${id} does not exist`);
	}
	const assetString = assetBuffer.toString();
	const asset = JSON.parse(assetString);
	return asset;
}


class Utopiamaker extends Contract {
    
    async Init(ctx){
        const initialized = await ctx.stub.getState('initialized');
        if (!initialized || initialized.length === 0) {
           await ctx.stub.putState('initialized',JSON.stringify({status:'true'}));
           await ctx.stub.putState('userCount', JSON.stringify({count:0}));
           await ctx.stub.putState('projectCount', JSON.stringify({count:0}));
           await ctx.stub.putState('transactionCount', JSON.stringify({count:0}));
        } else {
            throw new Error(`Yet the contract was initialized`);
        }

    }


    
    async CreateUser(ctx, name, country, email, password) {
        var currentCount = await readState(ctx, 'userCount');
        const id = 'user'.concat(currentCount.count);
        const user = {
            id: id,
            name: name,
            nationality: country,
            email: email,
            password: password,
            projects: []
        };
        await ctx.stub.putState(id, JSON.stringify(user));
        await ctx.stub.putState('userCount', JSON.stringify({count:currentCount.count+1}));
    }

    async CreateProject(ctx, name, startDate, endDate, description, contributors, validators, password) {
        if(!isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate))){
            throw new Error('Dates are not valid');
        }
        var currentCount = await readState(ctx, 'userCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'project'.concat(currentCount.count);
        const project = {
            id: id,
            name: name,
            description: description,
            timestamp: Date.now(),
            assets:[],
            contributors: contributors.split(','),
            validators:validators.split(','),
            password: password
        };
        await ctx.stub.putState(id, JSON.stringify(project));
        await ctx.stub.putState('projectCount', JSON.stringify({count:currentCount.count+1}));
    }

    async CreateTransaction(ctx, projectId, userId, projectPassword, userPassword, assets) {
        const userData = await readState(ctx, userId);
        const projectData = await readState(ctx, projectId);
        if(userData.password != userPassword){
            throw new Error('User password invalid');
        }
        if(projectData.password != projectPassword){
            throw new Error('Project password invalid');
        }
        var checkContributor = false;
        projectData.contributors.every(element => {
            if(element == userId){
                checkContributor = true;
                return false;
            }
        });
        if(!checkContributor){
            throw new Error('You are not a contributor');
        }
        var currentCount = await readState(ctx, 'transactionCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'transaction'.concat(currentCount.count);
        const transaction = {
            id: id,
            projectId: projectId,
            timestamp: Date.now,
            assets: JSON.parse(assets),
            statusValidate: false
        };
        await ctx.stub.putState(id, JSON.stringify(transaction));
        await ctx.stub.putState('transactionCount', JSON.stringify({count:newCount}));
    }


    async validateTransaction(ctx, transactionId, userId, projectPassword, userPassword, value) {
        if(typeof bool !== 'boolean'){
            throw new Error('User password invalid');
        }
        const userData = await readState(ctx, userId);
        if(userData.password != userPassword){
            throw new Error('User password invalid');
        }
        var transactionData = await readState(ctx, transactionId);
        var projectData = await readState(ctx, transactionData.projectId);
        if(projectData.password != projectPassword){
            throw new Error('Project password invalid');
        }
        var checkValidator = false;
        projectData.validators.every(element => {
            if(element == userId){
                checkValidator = true;
                return false;
            }
        });
        if(!checkValidator){
            throw new Error('You are not a validator');
        }
        if(value){
            projectData.assets.push(transactionData.assets);
            await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        }
        transactionData.statusValidate = true;
        await ctx.stub.putState(transactionData.id, JSON.stringify(transactionData));

    }

    async GetInitStatus(ctx) {
        const query = await ctx.stub.getState('initialized');
        return query.toString();
    }

    async GetUserCount(ctx) {
        const query = await ctx.stub.getState('userCount');
        return query.toString();
    }

    async GetProjectCount(ctx) {
        const query = await ctx.stub.getState('projectCount');
        return query.toString();
    }

    async GetTransactionCount(ctx) {
        const query = await ctx.stub.getState('transactionCount');
        return query.toString();
    }

    async GetUser(ctx, id) {
        const query = await ctx.stub.getState(id);
        
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        return query.toString();
        
    }  

    async GetProject(ctx, id) {
        var query = await ctx.stub.getState(id); 
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        query.password = null;
        return query.toString();
        
    }

    async GetTransaction(ctx, id) {
        var query = await ctx.stub.getState(id);
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        query.password = null;
        return query.toString();
        
    }
}

module.exports = Utopiamaker;
