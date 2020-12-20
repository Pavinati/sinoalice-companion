const fs = require('fs');
const INPUT_FILE_URL = './weapons.csv';
const TARGET_FILE_URL = '../src/WeaponsTable.js';

const parseLine = (line) => {
  const arr = line.split(',');
  return {
    id:                     parseInt(arr[0]),
    front_skill_id:         parseInt(arr[1]),
    back_skill_id:          parseInt(arr[2]),
    auto_skill_id:          parseInt(arr[3]),
    // 4: quest_skill_id
    // 5: art_skill_id
    // 6: quest_art_skill_id
    // 7: protector_skill_id
    // 8: team_id
    // 9: akb_member_id
    // 10: series_id
    name:                   arr[11],
    short_name:             arr[12],
    // 13: resource_name
    // 14: asset_bundle_name
    // 15: card_id
    // 16: role_type
    card_type:              parseInt(arr[17]),
    card_detail_type:       parseInt(arr[18]),
    weapon_type:            parseInt(arr[19]),
    // 20: set_effect_series_id
    rarity:                 parseInt(arr[21]),
    // 22: give_item_id
    // 23: medal_count
    attribute:              parseInt(arr[24]),
    // 25: kind
    // 26: kind_detail
    // 27: mode_type
    // 28: shader_type
    max_level:              parseInt(arr[29]),
    max_p_atk:              parseInt(arr[30]),
    max_m_atk:              parseInt(arr[31]),
    max_p_def:              parseInt(arr[32]),
    max_m_def:              parseInt(arr[33]),
    add_p_atk:              parseInt(arr[34]),
    add_m_atk:              parseInt(arr[35]),
    add_p_def:              parseInt(arr[36]),
    add_m_def:              parseInt(arr[37]),
    // 38: default_sell_price
    // 39: description
    evolution_level:        parseInt(arr[40]),
    max_evolution_level:    parseInt(arr[41]),
    deck_cost:              parseInt(arr[42]),
    // 43: material_skill_exp
    // 44: material_merge_exp
    is_infinite_evolution:  parseInt(arr[45]),
    // 46: is_parameter_custom_enabled
    // 47: is_skill_custom_enabled
    // 48: is_deck_disabled
    // 49: is_release
    // 50: created_time
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
const weaponsTable = ${stringDictionary};

export default weaponsTable;
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
