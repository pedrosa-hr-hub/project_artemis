//inciando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const server = express()
const mongoose = require('mongoose')
const adm = require('./routes/adm')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)

//config
    //session
    
        server.use(session({
            secret: "NodeJS",
            resave: true,
            saveUninitialized: true
        }))

        server.use(passport.initialize())
        server.use(passport.session())
        server.use(flash())

    //middleware

        server.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next();
        })
    //body parser

        server.use(bodyParser.urlencoded({extended: true}))
        server.use(bodyParser.json())

    //handlebars

        server.engine('handlebars', handlebars({defaultLayout: 'main'}))
        server.set('view engine', 'handlebars')

    //mongoose

        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/netblog").then(()=>{
            console.log("CONECTADO AO BANCO")
        }).catch((err)=>{
            console.log("ERRO AO CONECTAR " + err)
        })

    //public
        server.use(express.static(path.join(__dirname,'public')))

        server.use((req, res, next) =>{
            console.log("MIDDLEWARE ATIVO")
            next();
        })
//rotas
    
    server.get('/', (req, res)=>{
        Postagem.find().populate('categoria').lean().sort({data: 'desc'}).then((postagens)=>{
            res.render('index', {postagens: postagens})
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao abrir o blog")
            res.redirect('/404')
        })  
    })

    server.get('/404', (req, res)=>{
        res.send('ERRO! Fora do AR')
    })

    server.get('/postagem/:slug', (req,res) => {
        const slug = req.params.slug
        Postagem.findOne({slug})
            .then(postagem => {
                if(postagem){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    })

    server.get('/categorias', (req, res)=>{

        Categoria.find().lean().then((categorias)=>{

            res.render('categorias/index',{categorias: categorias})

        }).catch((err)=>{

            req.flash("error.msg", "Erro interno")
            res.redirect('/')

        })
    })

    server.get('/categorias/:slug', (req, res)=>{

        Categoria.findOne({slug: req.params.slug}).lean().then((categorias)=>{

            if(categorias){
                
                Postagem.find({categoria: categorias._id}).lean().then((postagens)=>{

                    res.render('categorias/postagens', {postagens: postagens, categorias: categorias})
                }).catch((err)=>{
                    req.flash('error_msg', 'Erro ao listar posts!')
                    res.redirect('/')
                })

            }else{

                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')

            }
        }).catch((err)=>{

            req.flash('error_msg', "Erro interno")
            res.redirect('/')

        })
    })


    server.use('/adm', adm)
    server.use('/usuarios', usuarios)

//afins
server.listen(8085, ()=>{
    console.log("SERVIDOR ONLINE")
})