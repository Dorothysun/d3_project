/* global d3 Company Employee */

// ------ EXAMPLE
const exampleCompany = new Company({
  numTiers: 8,
  topTierSize: 20,
  tierGrowthFactor: 1.5
});
console.log('before step');
console.log(exampleCompany.groupByType());
exampleCompany.step({
  attritionRate: 0.15,
  bias: 0.05
});
console.log('after step');
console.log(exampleCompany.groupByType());
exampleCompany.resetEmployees();
console.log('after reset');
console.log(exampleCompany.groupByType());
