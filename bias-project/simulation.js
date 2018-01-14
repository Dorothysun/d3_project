/* global d3 */

// ------ SIMULATION
class Employee {
  constructor ({type, startingTier = 0}) {
    this.type = type;
    this.performanceEvals = [];
    this.tierHistory = [startingTier];
  }
  get currentTier () {
    return this.tierHistory[this.tierHistory.length - 1];
  }
  generatePerformanceEval (max) {
    const result = Math.random() * max;
    this.performanceEvals.push(result);
    return this
  }
  get avePerformance () {
    return d3.mean(this.performanceEvals);
  }
  promote () {
    this.tierHistory.push(this.currentTier + 1);
    return this;
  }
  static randomType () {
    if (Math.random() > 0.5) {
      return 'favored';
    } else {
      return 'disfavored';
    }
  }
}

function betweenZeroAndOne (n) {
  return n >= 0 || n <= 1;
}

class Company {
  constructor ({numTiers, topTierSize, tierGrowthFactor}) {
    numTiers = Number(numTiers);
    if (!(numTiers > 1)) {
      throw new TypeError(`Number of tiers must be greater than 1, not "${numTiers}"`);
    }
    topTierSize = Number(topTierSize);
    if (!(topTierSize >= 10)) {
      throw new TypeError(`Top tier size must be greater than or equal to 10, not "${topTierSize}"`);
    }
    tierGrowthFactor = Number(tierGrowthFactor);
    if (!(tierGrowthFactor > 1)) {
      throw new TypeError(`Tier growth factor must be greater than 1, not "${tierGrowthFactor}"`);
    }
    this.numTiers = numTiers;
    this.topTierSize = topTierSize;
    this.tierGrowthFactor = tierGrowthFactor;
    this.resetEmployees();
  }
  prospectiveTierSize (tierIdx) {
    let size = this.topTierSize;
    for (let i = tierIdx; i < this.numTiers - 1; i++) {
      size = Math.ceil(this.tierGrowthFactor * size);
      if (size % 2 === 1) size++;
    }
    return size;
  }
  resetEmployees () {
    this.tiers = [];
    for (let i = 0; i < this.numTiers; i++) {
      this.tiers.push([]);
    }
    for (let idx = 0; idx < this.numTiers; idx++) {
      const needed = this.prospectiveTierSize(idx);
      for (let i = 0; i < needed / 2; i++) {
        this.addNewEmployee({
          type: 'favored',
          tierIdx: idx
        });
        this.addNewEmployee({
          type: 'disfavored',
          tierIdx: idx
        });
      }
      if (needed % 2 === 1) {
        this.addNewEmployee({tierIdx: idx});
      }
    }
    return this;
  }
  addNewEmployee ({tierIdx, type = Employee.randomType()}) {
    this.tiers[tierIdx].push(new Employee({
      type,
      startingTier: tierIdx
    }));
    return this;
  }
  get tierNames () {
    return this.tiers.map((_, idx) => `Tier ${idx + 1}`);
  }
  groupByType () {
    const grouped = [];
    for (let idx = 0; idx < this.tiers.length; idx++) {
      const tier = this.tiers[idx];
      const obj = {
        name: `Tier ${idx + 1}`,
        favored: 0,
        disfavored: 0
      };
      for (const employee of tier) {
        obj[employee.type]++;
      }
      grouped.push(obj);
    }
    return grouped;
  }
  attrition (rate) {
    rate = Number(rate);
    if (!betweenZeroAndOne(rate)) {
      throw new TypeError(`Attrition rate should be a value between 0 and 1, not "${rate}"`);
    }
    for (let idx = 0; idx < this.numTiers; idx++) {
      const tier =  d3.shuffle(this.tiers[idx]);
      let countdown = Math.floor(rate * tier.length);
      while (countdown-- > 0) {
        tier.pop();
      }
    }
    return this;
  }
  generateEvals (bias) {
    if (typeof bias !== 'function') {
      bias = this.standardBiasFn(bias);
    }
    for (const tier of this.tiers) {
      for (const employee of tier) {
        employee.generatePerformanceEval(bias(employee));
      }
    }
    return this;
  }
  standardBiasFn (bias) {
    bias = Number(bias);
    if (!betweenZeroAndOne(bias)) {
      throw new TypeError(`Bias should be a value between 0 and 1, not "${bias}"`);
    }
    const lookup = {
      favored: 100,
      disfavored: 100 - (100 * bias)
    };
    return person => lookup[person.type];
  }
  static getTopPerformers (tier, amount) {
    return new Set(
      tier.sort(
        (a, b) => b.avePerformance - a.avePerformance
      )
      .slice(0, amount)
    );
  }
  promotion (bias) {
    this.generateEvals(bias);
    for (let toTierIdx = this.numTiers - 1; toTierIdx >= 1; toTierIdx--) {
      const fromTierIdx = toTierIdx - 1;
      const fromTier = this.tiers[fromTierIdx];
      const toTier = this.tiers[toTierIdx];
      const numNeeded = this.prospectiveTierSize(toTierIdx) - toTier.length;
      const toPromote = Company.getTopPerformers(fromTier, numNeeded);
      this.tiers[fromTierIdx] = this.tiers[fromTierIdx].filter(
        employee => !toPromote.has(employee)
      );
      for (const employee of toPromote) {
        toTier.push(employee);
      }
    }
    return this;
  }
  fillEntryTier () {
    const numNeeded = this.prospectiveTierSize(0) - this.tiers[0].length;
    for (let i = 0; i < numNeeded; i++) {
      this.addNewEmployee({tierIdx: 0});
    }
    return this;
  }
  step ({attritionRate, bias}) {
    return this.attrition(attritionRate).promotion(bias).fillEntryTier();
  }
}
