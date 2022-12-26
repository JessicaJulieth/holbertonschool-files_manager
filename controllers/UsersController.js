const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function postNew(req, res) {
  const { email } = req.body;
  const pwd = req.body.password;

  if (!email) res.status(400).json({ error: 'Missing email' });
  if (!pwd) res.status(400).json({ error: 'Missing password ' });

  const found = await dbClient.client.collection('users').find({ email }).count();
  if (found > 0) {
    res.status(400).json({ error: 'Already exist' });
    return;
  }
  const usr = { email, password: sha1(pwd) };
  const user = await dbClient.client.collection('users').insertOne(usr);
  if (user) res.status(201).json({ id: user.ops[0]._id, email: user.ops[0].email });
  else res.status(500).json({ error: 'Could not create user' });
}

async function getMe(req, res) {
  const key = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${key}`);
  if (userId) {
    const user = await dbClient.client.collection('users').findOne({ _id: ObjectId(userId) });
    res.json({ id: user._id, email: user.email });
  } else res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { postNew, getMe };
