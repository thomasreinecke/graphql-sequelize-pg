
export default (sequelize, DataTypes) => {
    const UserRole = sequelize.define('userrole',
        {
            userId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            roleId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            }
        },
        {
            freezeTableName: true,
            tableName: 'userrole',
        }
    );
    return UserRole;
};