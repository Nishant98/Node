const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
	.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		console.log('favoriteRouter ', req.user);
		Favorites.find({ 'user': req.user._id })
			.populate('user')
			.populate('dishes')
			.then((dishes) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dishes);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		let userId = req.user._id;
		let reqData = req.body;
		console.log('req.body', req.body);
		console.log('dishId', reqData);
		Favorites.find({ 'user': userId })
			.then((favorites) => {
				console.log('favorites ', favorites)
				if (favorites.length) {
					reqData.forEach(item => {
						favorites[0].dishes.push(item._id);
					})
					favorites[0].save()
						.then((favorites) => {
							Favorites.findById(favorites._id)
							.populate('user')
							.populate('dishes')
							.then((favorites) => {
								console.log('Added Favorites!', favorites);
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(favorites);
							})
						}, (err) => next(err));
				} else {
					Favorites.create({ 'user': userId })
						.then((favorites) => {
							reqData.forEach(item => {
								favorites.dishes.push(item._id);
							});
							favorites.save()
								.then((favorites) => {
									Favorites.findById(favorites._id)
									.populate('user')
									.populate('dishes')
									.then((favorites) => {
										console.log('Created Favorites!', favorites);
										res.statusCode = 200;
										res.setHeader('Content-Type', 'application/json');
										res.json(favorites);
									})
								}, (err) => next(err));
						}, (err) => next(err));
				}

			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		var userId = req.user._id;
		Favorites.remove({ user: userId })
			.then((resp) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(resp);
			}, (err) => next(err))
			.catch((err) => next(err));
	});


favoriteRouter.route('/:dishId')
	.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
	.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
		 Favorites.findOne({user: req.user._id})
		 .then((favorites) => {
			if (!favorites) {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				return res.json({"exists": false, "favorites": favorites});
			}
			else {
				if (favorites.dishes.indexOf(req.params.dishId) < 0) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json({"exists": false, "favorites": favorites});
				}
				else {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json({"exists": true, "favorites": favorites});
				}
			}
	
		}, (err) => next(err))
		.catch((err) => next(err))
	})
	.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
		let userId = req.user._id;
		let reqData = req.params.dishId;
		console.log('req.body', req.body);
		console.log('dishId', reqData);
		Favorites.find({ 'user': userId })
			.then((favorites) => {
				console.log('favorites ', favorites)
				if (favorites.length) {

					favorites[0].dishes.push(reqData);
					favorites[0].save()
						.then((favorites) => {
							Favorites.findById(favorites._id)
							.populate('user')
							.populate('dishes')
							.then((favorites) => {
								console.log('Added Favorites!', favorites);
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(favorites);
							})
						}, (err) => next(err));

				} else {
					Favorites.create({ 'user': userId })
						.then((favorites) => {
							favorites.dishes.push(reqData);
							favorites.save()
								.then((favorites) => {
									Favorites.findById(favorites._id)
									.populate('user')
									.populate('dishes')
									.then((favorites) => {
										console.log('Added Favorites!', favorites);
										res.statusCode = 200;
										res.setHeader('Content-Type', 'application/json');
										res.json(favorites);
									})
								}, (err) => next(err));
						}, (err) => next(err));
				}

			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
		let userId = req.user._id;
		var dishId = req.params.dishId;

		Favorites.findOne({'user': userId})
			.then((favorites) => {
				console.log('Delete by Id ', favorites);
				favorites.dishes = favorites.dishes.filter((item) => item != dishId);

				favorites.save()
					.then((favorites) => {
						Favorites.findById(favorites._id)
							.populate('user')
							.populate('dishes')
							.then((favorites) => {
								console.log('Added Favorites!', favorites);
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(favorites);
							})
					}, (err) => next(err));
			}, (err) => next(err))
			.catch((err) => next(err));
	})


module.exports = favoriteRouter;