
export default (sequelize, DataTypes) => {
    const User = sequelize.define('user',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            serial: {
                type: DataTypes.STRING(10),
                unique: true,
                allowNull: false
            },
            firstName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            orgId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            }
        },
        {
            freezeTableName: true,
            tableName: 'user',
            indexes: [
                {
                    unique: false,
                    fields: ['serial']
                }
            ]
        }
    );
    return User;
};