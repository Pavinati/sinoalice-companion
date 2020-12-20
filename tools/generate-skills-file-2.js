const fs = require('fs');
const INPUT_FILE_URL = './skills_2.csv';
const TARGET_FILE_URL = '../src/SkillMultiplierTable2.js';

const parseLine = (line) => {
  const arr = line.split(',');
  return {
    id:              parseInt(arr[0]),
    category:        parseInt(arr[1]),
    // Set effect id [2]
    name:            arr[3],
    description:     arr[4],
    effect:          arr[5],
    sp_cost:         parseInt(arr[6]),
    max_level:       parseInt(arr[7]),
    resource_name:   parseInt(arr[8]),
    type:            parseInt(arr[9]),
    type_lavel:      arr[10],
    primary_icon:    parseInt(arr[11]),
    secondary_icon:  parseInt(arr[12]),
    range_icon:      parseInt(arr[13]),
    auto_skill:      parseInt(arr[14]),
  }
};

const writeSkillsToFile = (skills) => {
  fs.rmSync(TARGET_FILE_URL, {force: true})

  const skillObject = {};
  skills.forEach((skill) => {
    skillObject[skill.id] = skill;
  });

  const stringDictionary = JSON.stringify(skillObject, ' ', 2);
  const fileText = `
const skillMultiplierTable2 = ${stringDictionary};

export default skillMultiplierTable2;
`

  fs.writeFile(TARGET_FILE_URL, fileText, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Ok');
    }
  });
};

fs.readFile(INPUT_FILE_URL, 'utf8', function(err, data) {
  if (err) {
    throw err;
  }

  const skills = data
    .split('\n')
    .slice(1)
    .map(parseLine)

  writeSkillsToFile(skills);
});
