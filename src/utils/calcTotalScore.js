/* eslint-disable camelcase */ // for grading_speed
export default function calcTotalScore(data) {
  const {
    attitude,
    availability,
    clarity,
    grading_speed,
    resourcefulness,
    easiness,
    workload,
    recommended,
  } = data;
  // eslint-disable-next-line max-len
  return ((((((attitude + availability + clarity + grading_speed + resourcefulness) / 5) + ((easiness + workload) / 2)) / 2) * 0.8) + (recommended * 0.2)).toFixed(1);
}
