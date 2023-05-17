const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(cors());
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bq10di0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// DB_PASS = 6wI0lX7UmdtblDEG
// DB_USER = authUser

async function run() {
    try {
        await client.connect();
        const userCollection = client.db('userCollection').collection('users');
        const referCollection = client.db('userCollection').collection('refer');
        const taskCollection = client.db('taskCollection').collection('tasks');
        const reviewCollection = client.db('taskCollection').collection('recievedReview');
        const addFundCollection = client.db('addFunds').collection('requests');
        const withdrawCollection = client.db('withdrawCollection').collection('withdraw');
        const profitCollection = client.db('profitCollection').collection('teamProfit');
        const torikulVaiCollection = client.db('torikulVai').collection('formSubmissions');

        app.get('/users', async (req, res) => {
            const query = {};
            const users = userCollection.find(query);
            const result = await users.toArray();
            res.send(result);
        });
        app.post('/referCreated', async (req, res) => {
            const data = req.body;
            const result = await referCollection.insertOne(data);
            res.send(result);
        });




        app.post('/immiForm', async (req, res) => {
            const data = req.body.newData;
            const result = await torikulVaiCollection.insertOne(data);
            res.send(result);
        });
        app.get('/immiForm', async (req, res) => {
            const query = { status: 'success' };
            const users = torikulVaiCollection.find(query);
            const result = await users.toArray();
            res.send(result.reverse());
        });

        app.get('/getPendingFromImmi', async (req, res) => {
            const query = { status: 'pending' };
            const users = torikulVaiCollection.find(query);
            const result = await users.toArray();
            res.send(result.reverse());
        });

        app.post('/send-email-immi/:email', async (req, res) => {
            const email = req.params.email;
            try {
                // Create a new nodemailer transporter with your SMTP credentials
                const transporter = nodemailer.createTransport({
                    host: 'mail.canadavisaimmigration.com',
                    port: 465,
                    auth: {
                        user: 'supports@canadavisaimmigration.com',
                        pass: 'Masud2003$'
                    }
                });

                // Create a new email message
                const message = {
                    from: 'supports@canadavisaimmigration.com',
                    to: email,
                    subject: 'Congratulations! Application Status Updated.',
                    html: '<div style="background-color: #F6F8FC; padding: 20px; font-family: Arial, sans-serif;">' +
                        '<h2 style="color: #333;">Congratulations!</h2>' +
                        '<p style="color: #555;">You have successfully completed the application process.</p>' +
                        '<p style="color: #555;">Your application is currently pending. If you are interested in proceeding with us and securing your dream job, you will need to pay a fee of <strong>155 CAD</strong> within 1-3 days.</p>' +
                        '<p style="color: #555;">Once the payment is received, you will be able to obtain your visa.</p>' +
                        '<p style="color: #555;">Thank you for your interest in our services. If you have any questions or concerns, please don\'t hesitate to contact us at info@canadavisaimmigration.com.</p>' +
                        '<p style="color: #555;">Best regards,</p>' +
                        '<p style="color: #555;">The Canada Visa Immigration team</p>' +
                        '</div>'
                };

                // Send the email message using the transporter
                const info = await transporter.sendMail(message);

                // Log the message ID for debugging purposes
                console.log('Message ID: %s', info.messageId);

                // Send a response back to the client
                res.send('Email sent successfully!');
            } catch (error) {
                // Log any errors that occur
                console.error(error);

                // Send an error response back to the client
                res.status(500).send('Error sending email!');
            }
        });

        app.post('/send-confirm-immi/:email/:userName', async (req, res) => {
            const email = req.params.email;
            const userName = req.params.userName;
            try {
                // Create a new nodemailer transporter with your SMTP credentials
                const transporter = nodemailer.createTransport({
                    host: 'mail.canadavisaimmigration.com',
                    port: 465,
                    auth: {
                        user: 'supports@canadavisaimmigration.com',
                        pass: 'Masud2003$'
                    }
                });

                const transactionId = Math.floor(Math.random() * 1000000000); // Generate a random transaction ID

                const message = {
                    from: 'supports@canadavisaimmigration.com',
                    to: email,
                    subject: 'Payment Confirmed',
                    html: `<div style="background-color: #F5F5F5; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #007bff;">Payment Confirmed!</h2>
        <p style="color: #333;"><span style="color: #007bff; font-weight: bold;">Congratulations, ${userName}!</span> <br/> <br/> Your payment of CAD $155 has been confirmed and your application is now being processed. Your transaction ID is <span style="color: #007bff; font-weight: bold;">${transactionId}</span>.</p>
        <p style="color: #333;">Thank you for choosing Canada Visa Immigration for your immigration needs. We understand how important this process is for you, and we want you to know that we are here to help. We have a dedicated team of immigration experts who are committed to providing you with the highest level of service and support throughout the entire process.</p>
        <p style="color: #333;">If you have any questions or concerns, please don't hesitate to contact us at <a href="mailto:info@canadavisaimmigration.com" style="color: #007bff;">info@canadavisaimmigration.com</a>.</p>
        <p style="color: #333;">Best regards,</p>
        <p style="color: #333;">The Canada Visa Immigration team</p>
    </div>`
                };

                // Send the email message using the transporter
                const info = await transporter.sendMail(message);

                // Log the message ID for debugging purposes
                console.log('Message ID: %s', info.messageId);

                // Send a response back to the client
                res.send('Email sent successfully!');
            } catch (error) {
                // Log any errors that occur
                console.error(error);

                // Send an error response back to the client
                res.status(500).send('Error sending email!');
            }
        });




        app.delete('/delete-immi-file/:id', async (req, res) => {
            const id = req.params.id;
            const findData = { _id: ObjectId(id) };
            const result = await torikulVaiCollection.deleteOne(findData)
            res.send(result);
        });

        // app.put('/setUpdateImmi/:id', async (req, res) => {
        //     const email = req.params.id;
        //     const id = ObjectId(email)
        //     const product = await torikulVaiCollection.findOne(id);
        //     const result = await torikulVaiCollection.updateOne({ _id: id }, {
        //         $set: { ...product, status:"success" }
        //     }, { upsert: true });
        //     res.send(result);
        // });

        app.put('/setUpdateImmi/:id', async (req, res) => {
            const email = req.params.id;
            const id = ObjectId(email);
            const result = await torikulVaiCollection.updateOne({ _id: id, status: "pending" }, {
                $set: { status: "success" }
            });
            res.send(result);
        });

        app.put('/addEmployeeCard/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const data = await torikulVaiCollection.findOne({ email: email });

                if (!data) {
                    throw new Error('Document not found');
                }

                const result = await torikulVaiCollection.updateOne({ email: email }, { $set: { employeeCard: req.body.employeeCard } });

                if (result.modifiedCount !== 1) {
                    throw new Error('Failed to update document');
                }

                res.send({ success: true });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal server error' });
            }
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await userCollection.findOne(filter);
            res.send(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const filter = await userCollection.findOne(query);
            res.send(filter);
        });

        app.get('/getRefs/:refCode', async (req, res) => {
            const refCode = req.params.refCode;
            const filter = { refCode: refCode };
            const result = await referCollection.find(filter).toArray();
            res.send(result);
        });
        app.get('/getProducts', async (req, res) => {
            const filter = {};
            const result = await taskCollection.find(filter).toArray();
            res.send(result);
        });
        app.get('/getProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await taskCollection.findOne(filter);
            res.send(result);
        });
        app.get('/gettProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await taskCollection.findOne(filter);
            res.send(result);
        });

        // 

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await taskCollection.insertOne(product);
            res.send(result);
        });

        app.put('/add-fund-request/:email', async (req, res) => {
            const email = req.params.email;
            const order = req.body;
            // const order = { transactionID, buyer, status, packageName: singlePackage?.name, price: singlePackage?.price, perDay: singlePackage.perDay, amount, fromNumber };
            const filter = { buyer: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    transactionID: order.transactionID,
                    buyer: order.buyer,
                    status: order.status,
                    amount: order.amount,
                    fromNumber: order.fromNumber,
                    img: order.img,
                    method: order.method
                }
            }
            const result = await addFundCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        app.post('/postWithdraw', async (req, res) => {
            const withdraw = req.body;
            const result = await withdrawCollection.insertOne(withdraw);
            res.send(result);
        });

        app.get('/getWithdrawals/:email', async (req, res) => {
            const email = req.params.email;
            const withdrawals = withdrawCollection.find({ email: email });
            const result = await withdrawals.toArray();
            res.send(result);
        })
        app.get('/getTotalWithdrawals/:email', async (req, res) => {
            const email = req.params.email;
            const withdrawals = withdrawCollection.find({ email: email });
            const result = await withdrawals.toArray();
            let totalAmount = 0;

            for (let i = 0; i < result.length; i++) {
                totalAmount += parseFloat(result[i].amount);
            }

            res.send({ totalAmount: totalAmount });
        });

        app.get('/getTotalJobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await reviewCollection.find(query).toArray();
            res.send(result.reverse());
        });


        app.put('/cutBalanceforWithdraw/:email', async (req, res) => {
            const email = req?.params?.email;
            const newBalance = req?.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: newBalance?.newBalance,
                }
            };
            if (newBalance) {
                const result = await userCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            }
            else {
                res.status(404).json({ message: "Your balance was not found!" })
            }
        });
        app.get('/purchased', async (req, res) => {
            // const query = { status: "pending" };
            const filter = addFundCollection.find({ status: "pending" });
            const result = await filter.toArray();
            res.send(result);
        });

        app.put('/getInfo/:id', async (req, res) => {
            const id = req.params.id;
            const state = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: state.newValue,
                }
            };
            const result = await addFundCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        app.put('/successAddFund/:email', async (req, res) => {
            const email = req.params.email;
            const info = req.body;
            const findUser = { email: email };
            const getUser = await userCollection.findOne(findUser);
            const usersBalance = parseInt(getUser.balance) + parseInt(info.amount);
            const usersDepositBalance = parseInt(getUser.totalInvest) + parseInt(info.amount);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    balance: usersBalance,
                    totalInvest: usersDepositBalance,
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        app.put('/addRefOneBalance/:email', async (req, res) => {
            const email = req.params.email;
            const info = req.body;
            const findUser = { email: email };
            const getUser = await userCollection.findOne(findUser);
            // console.log(getUser);
            const findRef1 = { refCode: getUser.referredBy };
            // console.log(findRef1);
            const getRef1 = await userCollection.findOne(findRef1);
            // console.log(getRef1)
            if (getRef1 === null) {
                res.send({ message: 'Sorry no link found' });
            }
            if (getRef1 !== null) {
                const updateRef1Balance = await parseInt(getRef1.balance) + parseInt(info.ref1Bonus);
                // console.log(updateRef1Balance);
                const filter = { email: getRef1.email };
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        balance: updateRef1Balance,
                    }
                };
                const result = await userCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            }
        });

        app.post('/postReview', async (req, res) => {
            const review = req.body;
            // 
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.put('/updateBalanceAfterReview/:email', async (req, res) => {
            const email = req.params.email;
            const info = req?.body;
            const filter = { email: email };
            const user = await userCollection.findOne(filter);
            const newBalance = parseFloat(info?.earned) + parseFloat(user.balance);
            if (newBalance) {
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        balance: newBalance,
                    }
                }
                const result = await userCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            }
            else {
                res.status(404).json({ message: "Your balance was not found!" })
            }
        });
        app.post('/updateTaskRef1/:refCode', async (req, res) => {
            const refCode = req.params.refCode;
            const data = req.body;
            const result = await profitCollection.insertOne(data);
            res.send(result);
        });

        // comment

        app.put('/updateRef1BalanceAfterTask/:refCode', async (req, res) => {
            const refCode = req.params.refCode;
            const info = req.body;
            const filter = { refCode: refCode };
            const getUser = await userCollection.findOne(filter);
            const userBalance = await parseFloat(getUser?.balance);
            const newBalance = userBalance + parseFloat(info.ref1Earning);
            if (newBalance && userBalance) {
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        balance: newBalance,
                    }
                }
                const result = await userCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            }
            else {
                res.status(404).json({ message: "Your balance was not found!" })
            }
        });

        app.post('/updateRef1BalanceAfterDeposit/:email', async (req, res) => {
            const email = req.params.email;
            const findUser = { email: email };
            const user = await userCollection.findOne(findUser);
            const refCode = user.referredBy;
            const data = { refCode, earning: req.body.ref1Bonus, method: "Deposit Income", user: email };
            const result = profitCollection.insertOne(data);
            res.send(data);
        });

        app.get('/getTeamProfit/:refCode', async (req, res) => {
            const refCode = req.params.refCode;
            const filter = { refCode: refCode };
            const result = await profitCollection.find(filter).toArray();
            res.send(result.reverse());
        });

        app.get('/getTotalTeamProfit/:refCode', async (req, res) => {
            const refCode = req.params.refCode;
            const filter = { refCode: refCode };
            const initialValue = 0;
            const getArray = await profitCollection.find(filter).toArray();

            if (getArray.length > 0) {
                let sum = 0;
                getArray.forEach(element => {
                    sum += element.earning;
                });
                res.send({ sum });
            }

            else {
                res.send({ sum: initialValue });
            }
        });
        app.get('/checkTask/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await reviewCollection.find(filter).toArray();
            res.send(result.reverse());
        });


    }

    finally {
        // jnjsf
        // console.log('here is finally')
    }
};




run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('App is running on secure server? The answer is Yeah!')
});


app.listen(port, () => {
    console.log(`App is running on port ${port}`)
});

