const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.createEvent = async (event) => {
  let response;

  try {
    // Parsear el cuerpo de la solicitud
    const { nombre, descripcion, fecha, ubicacion, organizador, userId } =
      JSON.parse(event.body);

    if (!nombre || !descripcion || !fecha || !ubicacion || !organizador) {
      throw new Error("Todos los campos son obligatorios");
    }

    // Generar un ID único para el evento
    const eventoId = v4();
    const createDate = new Date().toISOString();
    const rquid = v4();
    const id = rquid;

    const newEvent = {
      id,
      eventoId,
      nombre,
      descripcion,
      fecha,
      ubicacion,
      organizador,
      createDate,
      userId,
    };

    // Intentar insertar el nuevo evento en DynamoDB
    await dynamodb
      .put({
        TableName: "Eventos",
        Item: newEvent,
      })
      .promise();

    // Respuesta exitosa
    const statusDesc = "Evento creado exitosamente";
    response = {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statusDesc,
        statusCode: 201,
        eventoId,
        createDate,
      }),
    };
  } catch (error) {
    console.error("Error al crear el evento:", error);

    // Manejo de errores
    let errorMessage = "Error interno del servidor";
    let errorDescription = "";
    let statusCode = 500;

    if (error.message === "Todos los campos son obligatorios") {
      errorMessage = error.message;
      statusCode = 400;
    }

    response = {
      statusCode,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statusDesc: errorMessage,
        statusMessage: errorDescription,
        statusCode,
      }),
    };
  }

  return response;
};
