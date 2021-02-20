
import db from '../src/db'

// synchronize the sequelize mode with postgres (and alters the database if needed)
console.log('Attention : db schema recreate started...');
db.sequelize.sync({ force: true, logging: console.log })
    .then(() => {
        console.log('performing basic ETL');
        runBasicETL();
        console.log('done');
    })
    .catch(err => {
        console.log("err: ", err)
    })
console.log("done")


// run some basic ETL
const runBasicETL = async () => {

    console.log("creating user")
    await db.userrole.destroy({
        where: {},
        truncate: true,
        cascade: true
    })

    await db.user.destroy({
        where: {},
        truncate: true,
        cascade: true
    })

    await db.org.destroy({
        where: {},
        truncate: true,
        cascade: true
    })

    await db.role.destroy({
        where: {},
        truncate: true,
        cascade: true
    })

    // create two example orgs
    let supportOrg = await db.org.create({
        name: 'Support',
    });

    let salesOrg = await db.org.create({
        name: 'Sales',
    });

    // create two example users
    let max = await db.user.create({
        serial: '000001',
        firstName: 'Max',
        lastName: 'FixesEverything',
        orgId: supportOrg.id
    });

    let tina = await db.user.create({
        serial: '000002',
        firstName: 'Tina',
        lastName: 'MoneyQueen',
        orgId: salesOrg.id
    });

    // create three example roles
    let supportRole = await db.role.create({
        name: 'Support Engineer',
    });

    let salesRole = await db.role.create({
        name: 'Sales Account Rep',
    });

    let managerRole = await db.role.create({
        name: 'Manager',
    });

    // finally create the role for max (support) and the roles for tine (sales and manager)
    await db.userrole.create({
        userId: max.id,
        roleId: supportRole.id 
    });

    await db.userrole.create({
        userId: tina.id,
        roleId: salesRole.id 
    });
    await db.userrole.create({
        userId: tina.id,
        roleId: managerRole.id 
    });
}

