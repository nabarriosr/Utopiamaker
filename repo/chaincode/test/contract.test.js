const assert = require('assert');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

// Importa el contrato
const MyContract = require('../path/to/MyContract.js');

describe('MyContract', () => {

    let contract;

    // Configura el contrato antes de cada prueba
    beforeEach(async () => {
        // Obtiene la ruta del archivo wallet del usuario
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        // Especifica el ID del canal y el nombre del contrato inteligente
        const channelName = 'mychannel';
        const chaincodeName = 'mychaincode';
        // Establece los detalles del cliente de gateway para conectarse a Fabric
        const gateway = new Gateway();
        const connectionProfilePath = path.resolve(__dirname, '..', 'connection.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
        const connectionOptions = {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true }
        };
        // Conecta el cliente a la red Fabric y obtiene el contrato
        await gateway.connect(connectionProfile, connectionOptions);
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        // Crea una instancia del contrato para cada prueba
        this.contract = new MyContract(contract);
    });

    // Prueba la creación de un usuario
    describe('#createUser()', () => {
        it('debería crear un nuevo usuario', async () => {
            await this.contract.createUser('user1', 'User One', 'user1@domain.com', 'Organization One');
            const user = await this.contract.getUser('user1');
            assert.equal(user.name, 'User One');
            assert.equal(user.email, 'user1@domain.com');
            assert.equal(user.organization, 'Organization One');
        });
    });

    // Prueba la creación de un proyecto
    describe('#createProject()', () => {
        it('debería crear un nuevo proyecto', async () => {
            await this.contract.createProject('Project One', 'project1', '2023-01-01', '2023-12-31', [], [], ['user1'], []);
            const project = await this.contract.getProject('project1');
            assert.equal(project.name, 'Project One');
            assert.equal(project.startDate, '2023-01-01');
            assert.equal(project.endDate, '2023-12-31');
            assert.deepEqual(project.investments, []);
            assert.deepEqual(project.assets, []);
            assert.deepEqual(project.contributors, ['user1']);
            assert.deepEqual(project.validators, []);
        });
    });

    // Prueba la creación de una interacción en un proyecto
    describe('#createProjectInteraction()', () => {
        it('debería crear una nueva interacción en el proyecto', async () => {
            await this.contract.createProjectInteraction('project1', 'user1', '2023-02-01', 'USD', 1000, []);
            const interaction = await this.contract.getInteraction(0);
            assert.equal(interaction.projectId, 'project1');
            assert.equal(interaction.username, 'user1');
            assert.equal(interaction.date, '2023-02-01');
            assert.deepEqual(interaction.investment, { currency: 'USD', amount: 1000 });
            assert.deepEqual(interaction.approvers, []);
        });
    });

    // Prueba la creación de una interacción entre dos personas
    describe('#createPersonInteraction()', () => {
        it('debería crear una nueva interacción entre dos personas', async () => {
            await this.contract.createPersonInteraction('user1', 'user2', '2023-03-01', 'USD', 500, []);
            const interaction = await this.contract.getInteraction(1);
            assert.equal(interaction.username1, 'user1');
            assert.equal(interaction.username2, 'user2');
            assert.equal(interaction.date, '2023-03-01');
            assert.deepEqual(interaction.investment, { currency: 'USD', amount: 500 });
            assert.deepEqual(interaction.approvers, []);
        });
    });

    // Prueba la validación de una interacción
    describe('#validateInteraction()', () => {
        it('debería validar una interacción', async () => {
            await this.contract.createPersonInteraction('user1', 'user2', '2023-03-01', 'USD', 500, []);
            const interaction = await this.contract.getInteraction(2);
            await this.contract.validateInteraction(interaction.id, 'user1');
            const validatedInteraction = await this.contract.getInteraction(2);
            assert.deepEqual(validatedInteraction.approvers, ['user1']);
        });
    });

    // Prueba la consulta de todos los proyectos
    describe('#getAllProjects()', () => {
        it('debería devolver todos los proyectos', async () => {
            const projects = await this.contract.getAllProjects();
            assert.equal(projects.length, 1);
        });
    });

    // Prueba la consulta de todas las interacciones
    describe('#getAllInteractions()', () => {
        it('debería devolver todas las interacciones', async () => {
            const interactions = await this.contract.getAllInteractions();
            assert.equal(interactions.length, 3);
        });
    });

});
