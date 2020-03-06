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
    }

    run() {

        


        
        
    }

    async order(data: any) {

        try {

            let outOfStock : any = {
                bool: false,
                data: []
            }


            /** proccess order*/
            let allProduct = await Product;

            await allProduct.map((el) => {
                if(el.product_id == data.product_id && el.stock < data.qty) {
                    outOfStock.bool = true;
                    outOfStock.data.push(el);
                }else{
                    if(el.product_id == data.product_id) {
                        el.stock = el.stock-data.qty;
                    }
                }
                
            });

            let filter = Product.filter((el) => el.product_id == data.product_id);

            // check product exist
            if(filter.length < 1) {
                return JSON.stringify({
                    errorMsg: 'Product not found.',
                    data: null
                });
            }

            // cek stock product
            if(outOfStock.bool) {

                return JSON.stringify({
                    errorMsg: 'Out of Stock',
                    data: outOfStock.data
                });

            } 

            return JSON.stringify({successMsg: 'success buy product', data: filter});

        } catch (error) {
            
        }
        
    }

    listen(port: number) { 
        let that = this;

         app.get('/order', async function(req:any, res:any){
            
            // data order
            let data: any = {
                    product_id : 3,
                    qty     : 2
                };


            let order = await that.order(data);
            console.log('order: ', order);
            
            
            // order 1
            await res.send(order);

            // order 2
            // that.order(data);



        });

        app.listen(port, function () {
            console.log(`listening on port ${port}`)
        });
    }

}

let main$ = new Main;
main$.run();
