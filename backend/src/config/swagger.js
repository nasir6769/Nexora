import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "B2B Merchant Network REST API",
      version: "1.0.0",
      description:
        "Comprehensive backend REST API for B2B Merchant Network connecting Merchants, Suppliers, Platform Admins, and Logistics.",
      contact: {
        name: "Merchant Network Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["merchant", "supplier", "admin"] },
            phone: { type: "string" },
            companyName: { type: "string" },
          },
        },
        InventoryItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            sku: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            lowStockThreshold: { type: "number" },
            status: { type: "string" },
          },
        },
        ProcurementRequest: {
          type: "object",
          properties: {
            id: { type: "string" },
            productName: { type: "string" },
            quantity: { type: "number" },
            totalAmount: { type: "number" },
            commitmentAmount: { type: "number" },
            status: { type: "string" },
            paymentStatus: { type: "string" },
          },
        },
        ResaleListing: {
          type: "object",
          properties: {
            id: { type: "string" },
            productName: { type: "string" },
            sku: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            quantity: { type: "number" },
            sellerName: { type: "string" },
            status: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
