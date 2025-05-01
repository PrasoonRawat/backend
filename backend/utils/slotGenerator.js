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