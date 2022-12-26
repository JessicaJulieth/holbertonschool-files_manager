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

module.exports = { postNew };
