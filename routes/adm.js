const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eadmin')

router.get('/', eAdmin, (req, res)=>{
    res.render('admin/index')
})

router.get('/post', eAdmin,(req, res)=>{
    res.send("Pagina de post")
})

router.get('/categoria', eAdmin,(req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', "Houve erro ao lista as categorias")
        res.redirect('/adm')
    })
    
})

router.get('/categoria/add', eAdmin, (req, res)=>{
    res.render('admin/addcategoria')
})

router.post('/categoria/nova', eAdmin, (req, res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome  == undefined || req.body.nome == null){
        erros.push({text: "Nome Invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({text: "Slug Invalido"})
    }

    if(erros.length > 0){
        res.render('admin/addcategoria', {erros: erros})
    }else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/adm/categoria')
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro em salvar a categoria, tente novamente!")
            res.redirect('/adm/categoria')    
        })
    }
    

})

router.get('/categoria/edit/:id', eAdmin, (req, res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategoria', {categoria: categoria})
    }).catch((err)=>{
        req.flash("error_mgs", "Essa categoria não existe")
        res.redirect('/adm/categorias')
    })
    
})

router.post('/categoria/edit', eAdmin,(req, res) => {

    let filter = { _id: req.body.id }
    let update = { nome: req.body.nome, slug: req.body.slug }

    Categoria.findOneAndUpdate(filter, update).then(() => {
        req.flash("success_msg", "Categoria atualizada")
        res.redirect('/adm/categoria')
    }).catch(err => {
        req.flash("error_msg", "Erro ao atualizar categoria")
    })

})

router.post('/categoria/deletar', eAdmin,(req, res)=>{

    let filter = { _id: req.body.id }
    let del = { nome: req.body.nome, slug: req.body.slug }

    Categoria.findOneAndDelete(filter, del).then(() => {
        req.flash("success_msg", "Categoria deletada")
        res.redirect('/adm/categoria')
    }).catch(err => {
        req.flash("error_msg", "Erro ao atualizar categoria")
    })

})

router.get('/postagens', eAdmin,(req, res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect('/adm')
    })
})

router.get('/postagens/add', eAdmin,(req, res)=>{
    Categoria.find().lean().then((categoria)=> {
        res.render('admin/addpostagens', {categoria:categoria})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar o formulario")
        res.redirect('adm/')
    })
})

router.post('/postagens/nova', eAdmin,(req, res)=>{

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text:"Categoria inválida, regristre uma categoria"})
    }
    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg","Postagem feita")
            res.redirect("/adm/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Erro interno a fazer postagem, tente novamente")
            res.redirect("/adm/postagens")
        })
    }

}) 

router.get('/postagens/edit/:id', eAdmin,(req, res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagens)=>{

        Categoria.find().lean().then((categorias)=>{
        res.render('admin/editpostagens',{categorias: categorias, postagens: postagens})
        })
    }).catch((err)=>{
        req.flash("error_msg", "Essa postagem não existe")
        res.redirect('/adm/postagens')
    })
})

router.post('/postagens/edit', eAdmin,(req, res)=>{
    let filtro = {_id: req.body.id}
    let update = {titulo: req.body.titulo, slug: req.body.slug, descricao: req.body.descricao, conteudo: req.body.conteudo}

    Postagem.findOneAndUpdate(filtro, update).then(() => {
        req.flash("success_msg", "Postagem editada")
        res.redirect('/adm/postagens')
    }).catch(err => {
        req.flash("error_msg", "Erro ao editar postagem")
    })


})

router.post('/postagens/deletar', (req, res)=>{
    
    let filtro = {_id: req.body.id}
    let del = {titulo: req.body.titulo, slug: req.body.slug, descricao: req.body.descricao, conteudo: req.body.conteudo}

    Postagem.findOneAndDelete(filtro, del).then(() => {
        req.flash("success_msg", "Postagem deletada")
        res.redirect('/adm/postagens')
    }).catch(err => {
        req.flash("error_msg", "Erro ao deletar postagem")
    })
})


module.exports = router