const { execSync } = require('child_process');

const CHAINCODE_ID = 'my-chaincode'; // Identificador del contrato
const CHAINCODE_PATH = './src'; // Ruta al código del contrato
const CHAINCODE_VERSION = '1.0.0'; // Versión del contrato
const CHANNEL_NAME = 'my-channel'; // Nombre del canal
const PEER_ADDRESS = 'localhost:7051'; // Dirección del peer al que conectarse
const ORDERER_ADDRESS = 'localhost:7050'; // Dirección del orderer al que conectarse

// Función para instalar el contrato en la red
async function installChaincode() {
  try {
    const command = `fabric-chaincode-node install --peer.address ${PEER_ADDRESS} --tlsRootCertFiles ./tls/ca.crt -n ${CHAINCODE_ID} -v ${CHAINCODE_VERSION} -p ${CHAINCODE_PATH}`;
    execSync(command);
    console.log('Contrato instalado con éxito');
  } catch (error) {
    console.error('Error al instalar el contrato:', error);
  }
}

// Función para desplegar el contrato en la red
async function deployChaincode() {
  try {
    const command = `fabric-chaincode-node start --peer.address ${PEER_ADDRESS} --tlsRootCertFiles ./tls/ca.crt --chaincode-id ${CHAINCODE_ID}:${CHAINCODE_VERSION} --chaincode-language javascript --channel-name ${CHANNEL_NAME} --orderer ${ORDERER_ADDRESS}`;
    execSync(command);
    console.log('Contrato desplegado con éxito');
  } catch (error) {
    console.error('Error al desplegar el contrato:', error);
  }
}

// Ejecutar las funciones para instalar y desplegar el contrato
installChaincode();
deployChaincode();
