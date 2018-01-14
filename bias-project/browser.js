/* global d3 Company Employee */

// ------ EXAMPLE

function getData() {
 const exampleCompany = new Company({
  numTiers: 8,
  topTierSize: 20,
  tierGrowthFactor: 1.5

  exampleCompany.step({
    attritionRate: 0.15,
    bias: 0.05
  });

  return exampleCompany.groupByType();
}
