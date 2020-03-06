import express  from'express';
import request  from 'superagent';
import redis    from 'redis';
import kue      from 'kue';


const queue = kue.createQueue();
const client    = redis.createClient();
const app       = express();
const key       = 'data';

const Product = [
    {
        product_id      : 1,
        product_name    : 'apple',
        stock           : 6
    },
    {
        product_id      : 2,
        product_name    : 'manggo',
        stock           : 10
    },
    {
        product_id      : 3,
        product_name    : 'orange',
        stock           : 4
    },
];

class Main {

    constructor() {
        this.listen(3000);
        this.order();
    }

    order() {

        // data order request
        let data: any = {
            product_id : 3,
            qty     : 2
        };

        // proccess
        queue.process('order', async (job: any, done: any) => {

            try {

                let outOfStock : any = {
                    bool: false,
                    data: []
                }

                /** proccess order*/
                let allProduct = await Product;

                // if product exist? cek stock and deduct stock product
                allProduct.map((el) => {
                    if(el.product_id == data.product_id && el.stock < data.qty) {
                        outOfStock.bool = true;
                        outOfStock.data.push(el);
                    }else{
                        if(el.product_id == data.product_id) {
                            el.stock = el.stock-data.qty;
                        }
                    }
                });

                // get product by id
                let filter = Product.filter((el) => el.product_id == data.product_id);

                // validation product is exist
                if(filter.length < 1) {
                    return done(JSON.stringify({
                        errorMsg: 'Product not found.',
                        data: null
                    }));
                }

                // validation stock product
                if(outOfStock.bool) {

                    return done(JSON.stringify({
                        errorMsg: 'Out of Stock',
                        data: outOfStock.data
                    }));

                } 

                return done(JSON.stringify({successMsg: 'success buy product', data: filter}));

            } catch (error) {
                
            }
        
        });
        
    }

    listen(port: number) { 

         app.get('/order', async function(req:any, res:any){
           
            const job = queue.create('order', {});

            job.on('failed', err => {
                console.log(err); 
            });

            job.on('complete', result => {
                console.log(result);
                res.send(result);
            });

            job.save();


        });

        app.listen(port, function () {
            console.log(`listening on port ${port}`)
        });
    }

}

let main$ = new Main;
