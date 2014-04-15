module.exports = {
  up: function(migration, DataTypes, done) {
    migration.changeColumn(
		  'Projects',
		  'description',
		  DataTypes.STRING(2047)
		)
		migration.changeColumn(
		  'Projects',
		  'description',
		  DataTypes.STRING(2047)
		)
    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}
