const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

// Middleware Connections
app.use(cors());
app.use(express.json());

// Mongo Connection URL
const url = "mongodb://localhost:27017/";

// Database Name
const dbName = "binary-tree-db";

app.get("/search/:startNodeId", async (req, res) => {
  const startNodeId = req.params.startNodeId;

  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    // Get the starting node from the database
    const startNode = await db
      .collection("nodes")
      .findOne({ _id: new ObjectId(startNodeId) });

    // Initialize the queue with the starting node
    const queue = [startNode];
    const visited = [];

    // Loop until all nodes have been visited
    while (queue.length > 0) {
      // Dequeue the next node from the front of the queue
      const currentNode = queue.shift();

      // Mark the current node as visited
      visited.push(currentNode);

      // Enqueue the current node's children (if they exist)
      if (currentNode.left) {
        const leftChild = await db
          .collection("nodes")
          .findOne({ _id: currentNode.left });
        queue.push(leftChild);
      }
      if (currentNode.right) {
        const rightChild = await db
          .collection("nodes")
          .findOne({ _id: currentNode.right });
        queue.push(rightChild);
      }
    }

    res.json({ visitedNodes: visited });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
