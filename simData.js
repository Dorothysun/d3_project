function getData() {
  const exampleCompany = new Company({
    numTiers: 8,
    topTierSize: 20,
    tierGrowthFactor: 1.5
  });
  exampleCompany.step({
    attritionRate: 0.15,
    bias: 0.05
  });

  var rawCounts = exampleCompany.groupByType();

  var percentages = rawCounts.map((tier) => {
    return {
      favored: tier.favored / (tier.disfavored + tier.favored),
      disfavored: tier.disfavored / (tier.disfavored + tier.favored)
    }
  });

  return percentages;
};
