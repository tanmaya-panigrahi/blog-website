const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// check login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorised" });

    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Unauthorised' })
    }
}



// get
// home

// admin login page

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "admin",
            description: "Welcome to the nodejs blog"
        }



        res.render('admin/index', { locals, layout: adminLayout });
    }
    catch (err) {
        console.log(err);
    }
})


// admin login page
//post method

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ userName: username });
        if (!user) {
            return res.status(401).json({ messsage: 'invalid credentials' });

        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ messsage: 'invalid credentials' });

        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');


    }
    catch (err) {
        console.log(err);
    }
})

// get
// admin dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "dashboard",
            description: "Welcome to the nodejs blog"
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout

        });

    } catch (err) {
        console.log(err);
    }

})





// get
// add post

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "add post",
            description: "Welcome to the nodejs blog"
        }
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (err) {
        console.log(err);
    }
})




// post
// add post 

router.post('/add-post', authMiddleware, async (req, res) => {

    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');

        } catch (err) {
            console.log(err);
        }

    } catch (err) {
        console.log(err);
    }

})



// get
// edit post

router.get('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        const locals={
            title:"edit post",
            description:"Welcome to the nodejs blog"
        
        }
        const data=await Post.findById({_id:req.params.id});
        res.render('admin/edit-post',{locals,data,layout:adminLayout});

    }catch(err){
        console.log(err);
    }
})


// put
// edit post
router.put('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.findByIdAndUpdate({_id:req.params.id},{
            title:req.body.title,
            body:req.body.body,
            updatedAt:Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
    }catch(err){
        console.log(err);
    }
});


// delete
// delete post
router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.findByIdAndDelete({_id:req.params.id});
        res.redirect('/dashboard');
    }catch(err){
        console.log(err);
    }
})

//get
// logout
router.get('/logout',authMiddleware,async(req,res)=>{
    res.clearCookie('token');
    res.redirect('/');
})

// admin register page
//post method

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // console.log(username, password);
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ userName: username, password: hashedPassword });
            res.status(201).json({ message: "user created successfully", user });
        }
        catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use ' });

            }
            res.status(500).json({ message: 'Internal server error' });

        }


    } catch (err) {
        console.log(err);
    }
})











module.exports = router;
