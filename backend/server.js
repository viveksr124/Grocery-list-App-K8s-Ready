const express = require( 'express' );
const mongoose = require( 'mongoose' );
const app = express();
app.use( express.json() );

// MongoDB Connection
mongoose.connect( 'mongodb://mongodb-service:27017/groceryDB', {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
    authSource: 'admin'
} );

// Item Schema
const Item = mongoose.model( 'Item', { name: String } );

// CRUD Routes
app.get( '/api/items', async ( req, res ) => {
    const items = await Item.find();
    res.json( items );
} );

app.post( '/api/items', async ( req, res ) => {
    const newItem = new Item( { name: req.body.name } );
    await newItem.save();
    res.status( 201 ).send( newItem );
} );

app.delete( '/api/items/:id', async ( req, res ) => {
    await Item.findByIdAndDelete( req.params.id );
    res.status( 204 ).send();
} );

app.listen( 3000, () => console.log( 'Backend running on port 3000' ) );