export const formatDecimalHours = (hoursDec) => {
  if (hoursDec === null || hoursDec === undefined || hoursDec === '' || isNaN(hoursDec)) return '—';
  const val = Number(hoursDec);
  if (val <= 0) return '—';
  
  const totalMinutes = Math.round(val * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hrs > 0 && mins > 0) {
    return `${hrs} h ${mins} min`;
  } else if (hrs > 0) {
    return `${hrs} h`;
  } else {
    return `${mins} min`;
  }
};

export const formatBreakMinutes = (minutes) => {
  if (minutes === null || minutes === undefined || minutes === '' || isNaN(minutes)) return '—';
  const val = Number(minutes);
  if (val <= 0) return '—';
  
  const hrs = Math.floor(val / 60);
  const mins = val % 60;
  
  if (hrs > 0 && mins > 0) {
    return `${hrs} h ${mins} min`;
  } else if (hrs > 0) {
    return `${hrs} h`;
  } else {
    return `${mins} min`;
  }
};
