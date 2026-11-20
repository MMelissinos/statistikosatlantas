const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'xartis/data/indicators');
const regions = JSON.parse(fs.readFileSync(path.join(root, 'xartis/data/geo/regions.json'))).nuts2;
const codes = Object.keys(regions);
const read = id => JSON.parse(fs.readFileSync(path.join(dataDir, `${id}.json`)));
const fmt = (v, d = 1) => Number(v).toLocaleString('en-US', {minimumFractionDigits:d, maximumFractionDigits:d});
const signed = (v, d = 1) => `${v > 0 ? '+' : ''}${fmt(v,d)}%`;
const ordinal = n => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
const rank = (values, code) => Object.entries(values).sort((a,b) => b[1]-a[1]).findIndex(x => x[0] === code) + 1;
const source = j => j.source?.page || 'https://ec.europa.eu/eurostat/';
const names = {
  EL30:'Attica', EL41:'North Aegean', EL42:'South Aegean', EL43:'Crete',
  EL51:'Eastern Macedonia and Thrace', EL52:'Central Macedonia', EL53:'Western Macedonia',
  EL54:'Epirus', EL61:'Thessaly', EL62:'Ionian Islands', EL63:'Western Greece',
  EL64:'Central Greece', EL65:'Peloponnese'
};

const census = read('census');
const configs = [
  {
    id:'population-change', year:'2011–2021', source:source(census), org:census.source?.org || 'ELSTAT',
    values:Object.fromEntries(codes.map(c => [c, (census.levels.nuts2['2021'][c] / census.levels.nuts2['2011'][c] - 1) * 100])),
    national:(census.national.all['2021'] / census.national.all['2011'] - 1) * 100,
    title:(n,v)=>`${n}: population ${signed(v)} between 2011 and 2021`,
    lead:(n,v,nat,r)=>`The permanent population of ${n} changed by ${signed(v)} between the 2011 and 2021 censuses, compared with ${signed(nat)} nationally. This was the ${ordinal(r)} largest change among Greece's 13 regions.`,
    note:'The comparison covers two census points and combines natural population change with population movements.'
  },
  {
    id:'ageing', year:'2021', j:read('ageing'), ratio:true,
    title:(n,v)=>`${n}: ${fmt(v)}% of residents were aged 65+ in 2021`,
    lead:(n,v,nat,r)=>`In ${n}, ${fmt(v)}% of permanent residents were aged 65 or older in the 2021 census, compared with ${fmt(nat)}% nationally. The region had the ${ordinal(r)} highest share among Greece's 13 regions.`,
    note:'The share refers to the permanent census population and is not an annual estimate.'
  },
  {
    id:'unemployment', year:'2025', j:read('unemployment'),
    title:(n,v)=>`${n}: unemployment at ${fmt(v)}% in 2025`,
    lead:(n,v,nat,r)=>`The unemployment rate in ${n} was ${fmt(v)}% in 2025, compared with ${fmt(nat)}% nationally. It was the ${ordinal(r)} highest rate among Greece's 13 regions.`,
    note:'Unemployment measures unemployed people aged 15–74 as a share of the labour force, not of the entire population.'
  },
  {
    id:'employment_rate', year:'2025', j:read('employment_rate'),
    title:(n,v)=>`${n}: employment rate at ${fmt(v)}% among ages 20–64`,
    lead:(n,v,nat,r)=>`In ${n}, ${fmt(v)}% of residents aged 20–64 were employed in 2025, compared with ${fmt(nat)}% nationally. It was the ${ordinal(r)} highest rate among Greece's 13 regions.`,
    note:'The employment rate includes people who worked for at least one hour in the reference week or were temporarily absent from work.'
  },
  {
    id:'household_income', year:'2023', j:read('household_income'),
    title:(n,v)=>`${n}: household income at ${fmt(v)}% of the EU average`,
    lead:(n,v,nat,r)=>`Household disposable income per resident in ${n} was ${fmt(v)}% of the EU average in 2023. The national figure was ${fmt(nat)}%, while the region ranked ${ordinal(r)} among Greece's 13 regions.`,
    note:'The indicator is expressed in purchasing power standards and measures household income, not the GDP produced in the region.'
  },
  {
    id:'poverty_risk', year:'2025', j:read('poverty_risk'),
    title:(n,v)=>`${n}: ${fmt(v)}% at risk of poverty in 2025`,
    lead:(n,v,nat,r)=>`In ${n}, ${fmt(v)}% of residents were at risk of poverty in the 2025 survey, compared with ${fmt(nat)}% nationally. It was the ${ordinal(r)} highest share among Greece's 13 regions.`,
    note:'The 2025 survey measures 2024 incomes. Regional estimates are sample-based, so small differences should be interpreted with care.'
  },
  {
    id:'life_expectancy', year:'2024', j:read('life_expectancy'),
    title:(n,v)=>`${n}: life expectancy at ${fmt(v)} years in 2024`,
    lead:(n,v,nat,r)=>`Life expectancy at birth in ${n} was ${fmt(v)} years in 2024, compared with ${fmt(nat)} years nationally. It was the ${ordinal(r)} highest among Greece's 13 regions.`,
    note:'Life expectancy is a hypothetical measure that applies age-specific mortality rates observed in 2024 across an entire lifetime.'
  },
  {
    id:'physicians', year:'2024', j:read('physicians'), decimals:0,
    title:(n,v)=>`${n}: ${fmt(v,0)} physicians per 100,000 residents`,
    lead:(n,v,nat,r)=>`${n} had ${fmt(v,0)} registered physicians per 100,000 residents in 2024, compared with ${fmt(nat,0)} nationally. It was the ${ordinal(r)} highest ratio among Greece's 13 regions.`,
    note:'The indicator counts physicians licensed to practise, not only those actively practising medicine, and does not measure residents’ geographic access to care.'
  },
  {
    id:'tertiary_census', year:'2021', j:read('tertiary_census'), ratio:true,
    title:(n,v)=>`${n}: ${fmt(v)}% of residents aged 15+ had tertiary education`,
    lead:(n,v,nat,r)=>`In ${n}, ${fmt(v)}% of permanent residents aged 15 or older had completed tertiary education in the 2021 census. The national share was ${fmt(nat)}%, while the region ranked ${ordinal(r)} among Greece's 13 regions.`,
    note:'The indicator covers tertiary qualifications held by permanent residents aged 15+ and not the share of young people currently enrolled in education.'
  }
];

for (const cfg of configs) {
  if (cfg.j) {
    const raw = cfg.j.levels.nuts2[cfg.year];
    if (cfg.ratio) {
      const den = cfg.j.denominator.levels.nuts2[cfg.year];
      cfg.values = Object.fromEntries(codes.map(c => [c, raw[c] / den[c] * 100]));
      cfg.national = cfg.j.national.all[cfg.year] / cfg.j.denominator.national.all[cfg.year] * 100;
    } else {
      cfg.values = raw;
      cfg.national = cfg.j.national.all[cfg.year];
    }
    cfg.source = source(cfg.j);
    cfg.org = cfg.j.source?.org === 'ΕΛΣΤΑΤ' ? 'ELSTAT' : (cfg.j.source?.org || 'Eurostat');
  }
}

const start = new Date('2026-11-21T00:00:00Z');
const posts = [];
for (let day = 0; day < configs.length; day++) {
  const cfg = configs[day];
  const date = new Date(start.getTime() + day * 86400000).toISOString().slice(0,10);
  for (let slot = 0; slot < 13; slot++) {
    const code = codes[(slot + day * 5) % 13];
    const name = names[code];
    const value = cfg.values[code];
    const r = rank(cfg.values, code);
    posts.push({
      greek_slug:`evrima-${date}-${cfg.id}-${code.toLowerCase()}`,
      title:cfg.title(name, value),
      slug:`finding-${date}-${cfg.id.replaceAll('_','-')}-${code.toLowerCase()}`,
      excerpt:cfg.lead(name, value, cfg.national, r),
      note:cfg.note,
      source:cfg.source,
      org:cfg.org,
      date:`${date}T${String(9+slot).padStart(2,'0')}:00:00`
    });
  }
}

process.stdout.write(JSON.stringify(posts));
