'use strict';


const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const params = {
  TableName: 'cadastro-pacientes-dev-PacientesTable-1PU3SPJEKICA'
};

module.exports.listarPacientes = async (event) => {

  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception", 
        message: err.message ? err.message : "Unknown error",
      })
    }
  }
  
};

module.exports.obterPaciente = async (event) => {
  try {
    const { pacienteId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        ...params,
        Key: {
          paciente_id: pacienteId,
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Paciente não existe" }, null, 2),
      };
    }

    const paciente = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(paciente, null, 2),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.cadastrarPaciente = async (event) => {
  try {
    const timestamp = new Date().getTime();

    let dados = JSON.parse(event.body);

    const { nome, data_nascimento, email, telefone } = dados;

    const paciente = {
      paciente_id: uuidv4(),
      nome,
      data_nascimento,
      email,
      telefone,
      status: true,
      criado_em: timestamp,
      atualizado_em: timestamp,
    };

    await dynamoDb
      .put({
        TableName: "PACIENTES",
        Item: paciente,
      })
      .promise();

    return {
      statusCode: 201,
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};


module.exports.atualizarPaciente = async (event) => {
  const { pacienteId } = event.pathParameters;

  try {
    const timestamp = new Date().getTime();
    let dados = JSON.parse(event.body);
    const { nome, data_nascimento, email, telefone } = dados;

    await dynamoDb.update({
      ...params,
      key: {
        paciente_id:pacienteId
      },
      UpdateExpression:
      'SET nome = :nome, data_nascimento = :dt, email = :email' +
      'telefone = :telefone, atualizado_em = :atualizado_em',
      ConditionExpression: 'attribute_exists(paciente_id)',
      ExpressionAttributeValues: {
        ':nome':nome,
        ':dt':data_nascimento,
        ':email':email,
        ':telefone':telefone,
        ':atualizado_em':timestamp
      }
    }).promise();
    return {
      statusCode: 204
    }
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
}