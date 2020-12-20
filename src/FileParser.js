function toBool(str) {
  return str === 'TRUE';
}

function toInt(str) {
  return parseInt(str);
}

const parseLine = (line) => {
  const arr = line.split(',');
  return {
    name:                arr[0],
    // 1) rarity
    evo_level:           toInt(arr[2]),
    limit_breaks:        toInt(arr[3]),
    level:               toInt(arr[4]),
    skill_level:         toInt(arr[5]),
    support_skill_level: toInt(arr[6]),
    unused:              toBool(arr[7]),

    id:                  toInt(arr[34]),
  }
};

const parseBlueLibraryCSV = ({ file, onParseFinish }) => {
  const onReadyRead = (e) => {
    const reader = e.target;
    const file = reader.result;
    const weaps = file
          .split('\n')
          .slice(2)
          .map(parseLine)
          .filter(weap => weap.name !== '');

    onParseFinish(weaps);
  };

  const reader = new FileReader();
  reader.onloadend = onReadyRead;
  reader.readAsText(file);
}

const FileParser = {
  parseBlueLibraryCSV,
};

export default FileParser;
