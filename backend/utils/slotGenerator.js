import moment from 'moment';

// function generateTimeSlots(startTime, endTime, interval) {
//   const slots = [];
//   let start = moment(startTime, 'HH:mm');
//   const end = moment(endTime, 'HH:mm');

//   while (start < end) {
//     const slotStart = start.format('HH:mm');
//     const slotEnd = moment(start).add(interval, 'minutes').format('HH:mm');

//     if (moment(slotEnd, 'HH:mm').isAfter(end)) break;

//     slots.push({ start: slotStart, end: slotEnd });
//     start.add(interval, 'minutes');
//   }

//   return slots;
// }

// export default generateTimeSlots;


// utils/timeSlots.js
export const generateTimeSlots = (start, end, interval) => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const slots = [];
  const startDate = new Date();
  startDate.setHours(startHour, startMin, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMin, 0, 0);

  while (startDate < endDate) {
    const hour = String(startDate.getHours()).padStart(2, '0');
    const min = String(startDate.getMinutes()).padStart(2, '0');
    slots.push(`${hour}:${min}`);
    startDate.setMinutes(startDate.getMinutes() + interval);
  }

  return slots;
};