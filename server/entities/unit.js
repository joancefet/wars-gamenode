function Unit(unitId, tileId, type, owner, carriedBy, health, deployed, moved, capturing) {
  this.unitId = unitId;
  this.tileId = tileId;
  this.type = type;
  this.owner = owner;
  this.carriedBy = carriedBy;
  this.health = health;
  this.deployed = deployed;
  this.moved = moved;
  this.capturing = capturing;
};

exports.Unit = Unit;

Unit.prototype.clone = function() {
  var u = new Unit();
  u.unitId = this.unitId;
  u.tileId = this.tileId;
  u.type = this.type;
  u.owner = this.owner;
  u.carriedBy = this.carriedBy;
  u.health = this.health;
  u.deployed = this.deployed;
  u.moved = this.moved;
  u.capturing = this.capturing;
  return u;
}

Unit.prototype.cloneFrom = function(other) {
  this.unitId = other.unitId;
  this.tileId = other.tileId;
  this.type = other.type;
  this.owner = other.owner;
  this.carriedBy = other.carriedBy;
  this.health = other.health;
  this.deployed = other.deployed;
  this.moved = other.moved;
  this.capturing = other.capturing;
  return this;
}