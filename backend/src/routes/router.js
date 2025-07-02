const express = require('express');
const router = express.Router();
const { addEvent } = require('../controllers/addEvent');

router.post('/addEvent', async(req,res) => {
    try {
      addEvent(req)
      return res.status(200).json({
        message : 'Evenement enregistré avec succès'
      })
    } catch(error) {
      return res.status(500).json({
        error : 'erreur serveur -> Route addEvent en faute.'
      })
    }
})