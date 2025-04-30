const express = require('express')
const router = express.Router()
const users = require('../../users')

// Get all users
router.get('/', async(req, res) => {
    res.send(await users.find())
});

// Get single user
router.get('/:id', async(req, res) => {
    const user = await users.findById(req.params.id)
    if (user == undefined) {
        res.status(400).json({ message: "this user is not available" });
    } else {
        res.status(200).json({ user: user });
    }
});

//create new user
router.post('/', async(req, res) => {
    const newuser = new users({//create new obect in db
        email: req.body.email, //read from the body of the request
        name: req.body.name,
        city: req.body.city
    })
    await newuser.save()
    .then(res.json({message: newuser}))
    .catch(err=>{
        res.status(400).json({ message: err })
    })

});

//update one user
router.put('/:id', async(req, res) => {
        const updateduser = await users.updateOne(
            {_id: req.params.id}, 
            {$set:{name : req.body.name,
                   city: req.body.city,
                   email: req.body.email,
             }})
        res.send(updateduser)
    }
)

//delete user
router.delete('/:id', async(req, res) => {
    try {
        const removeuser = await users.deleteOne({_id: req.params.id})
        res.send(removeuser)
} catch (error) {
        res.json({error})
    }
})


module.exports = router