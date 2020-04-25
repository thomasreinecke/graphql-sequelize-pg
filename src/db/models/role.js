
export default (sequelize, DataTypes) => {
    const Role = sequelize.define('role',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING(100),
                unique: true,
                allowNull: false
            }
        },
        {
            freezeTableName: true,
            tableName: 'role',
            indexes: [
                {
                    unique: false,
                    fields: ['name']
                }
            ]
        }
    );
    return Role;
};