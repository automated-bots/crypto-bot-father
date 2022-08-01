const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({ version: '1.0', name: 'Crypto Bot Father', devs: [{ name: 'Melroy van den Berg', email: 'melroy@melroy.org' }] })
})

module.exports = router
