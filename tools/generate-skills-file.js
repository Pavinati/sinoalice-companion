const fs = require('fs');
const INPUT_FILE_URL = './skills.csv';
const TARGET_FILE_URL = '../src/SkillMultiplierTable.js';

const parseLine = (line) => {
  const arr = line.split(',');
  return {
    id:            parseInt(arr[0]),
    name:          arr[1],
    jp_name:       arr[2],
    description:   arr[3],
    sp_cost:       parseInt(arr[4]),
    range_icon:    parseInt(arr[5]),
    damage_mult:   parseFloat(arr[6]),
    recovery:      parseFloat(arr[7]),
    p_atk:         parseFloat(arr[8]),
    m_atk:         parseFloat(arr[9]),
    p_def:         parseFloat(arr[10]),
    m_def:         parseFloat(arr[11]),
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
const skillMultiplierTable = ${stringDictionary};

export default skillMultiplierTable;
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
