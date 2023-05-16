/*
 * Define el contrato inteligente (smart contract) de Hyperledger Fabric en JavaScript
 */

'use strict';

// Define la clase de contrato
class MyContract {

    // Define el constructor
    constructor() {
        // Define las variables del contrato
        LocalContractStorage.defineMapProperty(this, 'users');
        LocalContractStorage.defineMapProperty(this, 'projects');
        LocalContractStorage.defineMapProperty(this, 'interactions');
        LocalContractStorage.defineProperty(this, 'userCount');
        LocalContractStorage.defineProperty(this, 'projectCount');
        LocalContractStorage.defineProperty(this, 'interactionCount');
    }

    // Función para crear un nuevo usuario
    createUser(username) {
        // Comprueba que el usuario no existe
        if (this.users.get(username)) {
            throw new Error(`El usuario '${username}' ya existe`);
        }
        // Crea un nuevo usuario
        const user = {
            username: username
        };
        // Almacena el usuario en la lista de usuarios
        this.users.put(username, user);
        // Incrementa el contador de usuarios
        this.userCount += 1;
    }

    // Función para crear un nuevo proyecto
    createProject(name, id, startDate, endDate, investments, assets, contributors, validators) {
        // Comprueba que el proyecto no existe
        if (this.projects.get(id)) {
            throw new Error(`El proyecto '${id}' ya existe`);
        }
        // Crea un nuevo proyecto
        const project = {
            name: name,
            id: id,
            startDate: startDate,
            endDate: endDate,
            investments: investments,
            assets: assets,
            contributors: contributors,
            validators: validators
        };
        // Almacena el proyecto en la lista de proyectos
        this.projects.put(id, project);
        // Incrementa el contador de proyectos
        this.projectCount += 1;
    }

    // Función para crear una nueva interacción en un proyecto
    createInteraction(projectId, username, investments) {
        // Comprueba que el proyecto existe
        const project = this.projects.get(projectId);
        if (!project) {
            throw new Error(`El proyecto '${projectId}' no existe`);
        }
        // Comprueba que el usuario existe
        const user = this.users.get(username);
        if (!user) {
            throw new Error(`El usuario '${username}' no existe`);
        }
        // Crea una nueva interacción
        const interaction = {
            projectId: projectId,
            username: username,
            investments: investments
        };
        // Almacena la interacción en la lista de interacciones
        this.interactions.put(this.interactionCount, interaction);
        // Incrementa el contador de interacciones
        this.interactionCount += 1;
    }

    // Función para crear una nueva interacción única entre dos usuarios
    createUniqueInteraction(username1, username2, investments) {
        // Comprueba que ambos usuarios existen
        const user1 = this.users.get(username1);
        if (!user1) {
            throw new Error(`El usuario '${username1}' no existe`);
        }
        const user2 = this.users.get(username2);
        if (!user2) {
            throw new Error(`El usuario '${username2}' no existe`);
        }
        // Crea una nueva interacción única
        const uniqueInteraction = {
            username1: username1,
            username2: username2,
            investments: investments
        };
        // Almacena la interacción única en la lista de interacciones
        this.interactions.put(this.interactionCount, uniqueInteraction);
        // Incrementa el contador de interacciones
        this.interactionCount += 1;
    }

    // Función para validar una interacción en un proyecto
    validateInteraction(interactionId, username) {
        // Comprueba que la interacción existe
        const interaction = this.interactions.get(interactionId);
        if (!interaction) {
            throw new Error(`La interacción '${interactionId}' no existe`);
        }
        // Comprueba que el usuario tiene permiso para validar la interacción
        const project = this.projects.get(interaction.projectId);
        if (!project) {
            throw new Error(`El proyecto '${interaction.projectId}' no existe`);
        }
        if (!project.validators.includes(username)) {
            throw new Error(`El usuario '${username}' no tiene permiso para validar interacciones en el proyecto '${interaction.projectId}'`);
        }
        // Valida la interacción
        interaction.validated = true;
        // Actualiza la interacción en la lista de interacciones
        this.interactions.put(interactionId, interaction);
    }

    // Función para obtener el número de usuarios
    getUserCount() {
        return this.userCount;
    }

    // Función para obtener el número de proyectos
    getProjectCount() {
        return this.projectCount;
    }

    // Función para obtener el número de interacciones
    getInteractionCount() {
        return this.interactionCount;
    }

    // Función para obtener un usuario por su nombre de usuario
    getUser(username) {
        return this.users.get(username);
    }

    // Función para obtener un proyecto por su ID de proyecto
    getProject(projectId) {
        return this.projects.get(projectId);
    }

    // Función para obtener una interacción por su ID de interacción
    getInteraction(interactionId) {
        return this.interactions.get(interactionId);
    }

    // Función para obtener todos los proyectos
    getAllProjects() {
      const result = [];
      // Recorre todos los proyectos y los agrega al resultado
      for (let i = 0; i < this.projectCount; i++) {
          result.push(this.projects.get(i));
      }
      return result;
    }

    // Función para obtener todas las interacciones
    getAllInteractions() {
      const result = [];
      // Recorre todas las interacciones y las agrega al resultado
      for (let i = 0; i < this.interactionCount; i++) {
          result.push(this.interactions.get(i));
      }
      return result;
    }

}

// Exporta la clase del contrato
module.exports = MyContract;
