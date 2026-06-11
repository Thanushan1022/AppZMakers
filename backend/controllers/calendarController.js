import CompanyEvent from '../models/CompanyEvent.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Company from '../models/Company.js';
import mongoose from 'mongoose';
import {
  fetchHolidaysFromGoogle,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '../services/googleCalendarService.js';

export const getEvents = async (req, res) => {
  try {
    const { employeeId, companyId } = req.query;

    let country = 'Sri Lanka';
    let office = 'Colombo';
    let localFilter = {};

    if (employeeId) {
      // Find employee by legacyId or ObjectId or userId
      let query = { $or: [{ legacyId: employeeId }] };
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.$or.push({ _id: employeeId });
        query.$or.push({ userId: employeeId });
      }
      const emp = await Employee.findOne(query);
      if (emp) {
        country = emp.country || 'Sri Lanka';
        office = emp.office || 'Colombo';
      }
      localFilter = {
        $or: [
          { targetLocation: 'all' },
          { targetLocation: 'country', targetValue: country },
          { targetLocation: 'branch', targetValue: office },
        ],
      };
    } else if (companyId) {
      // Find company by legacyId or ObjectId
      let query = { $or: [{ legacyId: companyId }] };
      if (mongoose.Types.ObjectId.isValid(companyId)) {
        query.$or.push({ _id: companyId });
      }
      const comp = await Company.findOne(query);
      if (comp) {
        country = comp.country || 'Sri Lanka';
      }
      localFilter = {
        $or: [
          { targetLocation: 'all' },
          { targetLocation: 'country', targetValue: country },
        ],
      };
    } else {
      localFilter = {};
    }

    const localEvents = await CompanyEvent.find(localFilter).sort({ start: 1 });

    const mergedEvents = localEvents.map((e) => {
      const obj = e.toObject ? e.toObject() : e;
      if (!employeeId && !companyId && obj.targetLocation === 'country' && obj.targetValue) {
        obj.title = `[${obj.targetValue}] ${obj.title}`;
      }
      return obj;
    });

    if (employeeId) {
      let query = { $or: [{ legacyId: employeeId }] };
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.$or.push({ _id: employeeId });
        query.$or.push({ userId: employeeId });
      }
      const emp = await Employee.findOne(query);
      if (emp) {
        const empId = emp.legacyId || emp._id.toString();
        const approvedLeaves = await LeaveRequest.find({
          employeeId: empId,
          status: 'approved'
        });
        approvedLeaves.forEach((leave) => {
          mergedEvents.push({
            id: leave._id,
            title: `Leave: ${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}`,
            description: `Approved ${leave.type} leave. Reason: ${leave.reason || 'None'}`,
            start: leave.startDate,
            end: leave.endDate,
            type: `${leave.type}-leave`,
            targetLocation: 'country',
            targetValue: country
          });
        });
      }
    }

    let googleHolidays = [];
    try {
      if (employeeId || companyId) {
        const hols = await fetchHolidaysFromGoogle(country);
        googleHolidays = hols.map(h => ({
          ...h,
          targetLocation: 'country',
          targetValue: country
        }));
      } else {
        const countriesToFetch = ['Sri Lanka', 'USA', 'UK', 'Canada', 'Australia'];
        const results = await Promise.all(
          countriesToFetch.map(async (c) => {
            try {
              const hols = await fetchHolidaysFromGoogle(c);
              return hols.map(h => ({
                ...h,
                title: `[${c}] ${h.title}`,
                targetLocation: 'country',
                targetValue: c
              }));
            } catch (err) {
              console.warn(`Could not fetch dynamic holidays for ${c}:`, err.message);
              return [];
            }
          })
        );
        googleHolidays = results.flat();
      }
    } catch (err) {
      console.warn(`Could not fetch Google Calendar holidays:`, err.message);
    }

    googleHolidays.forEach((holiday) => {
      const isDuplicate = mergedEvents.some(
        (le) =>
          le.googleEventId === holiday.googleEventId ||
          (le.title === holiday.title && le.start === holiday.start)
      );
      if (!isDuplicate) {
        mergedEvents.push(holiday);
      }
    });

    res.json(mergedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new event
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, type, targetLocation, targetValue, createdBy } = req.body;

    const event = new CompanyEvent({
      title,
      description,
      start,
      end,
      type,
      targetLocation,
      targetValue,
      createdBy: createdBy || 'HR Manager',
    });

    const googleEventId = await createGoogleCalendarEvent(event, targetLocation === 'country' ? targetValue : 'Global');
    event.googleEventId = googleEventId;

    await event.save();

    res.status(201).json({
      message: 'Calendar event created successfully',
      event,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start, end, type, targetLocation, targetValue } = req.body;

    const event = await CompanyEvent.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (start !== undefined) event.start = start;
    if (end !== undefined) event.end = end;
    if (type !== undefined) event.type = type;
    if (targetLocation !== undefined) event.targetLocation = targetLocation;
    if (targetValue !== undefined) event.targetValue = targetValue;

    if (event.googleEventId) {
      await updateGoogleCalendarEvent(event.googleEventId, event, event.targetLocation === 'country' ? event.targetValue : 'Global');
    }

    await event.save();

    res.json({
      message: 'Calendar event updated successfully',
      event,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CompanyEvent.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.googleEventId) {
      await deleteGoogleCalendarEvent(event.googleEventId, event.targetLocation === 'country' ? event.targetValue : 'Global');
    }

    await CompanyEvent.findByIdAndDelete(id);

    res.json({
      message: 'Calendar event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Import holidays for a country from Google public calendars
 */
export const importHolidays = async (req, res) => {
  try {
    const { country } = req.body;
    if (!country) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const holidays = await fetchHolidaysFromGoogle(country);
    
    let importedCount = 0;
    for (const holiday of holidays) {
      const exists = await CompanyEvent.findOne({
        $or: [
          { googleEventId: holiday.googleEventId },
          { title: holiday.title, start: holiday.start }
        ]
      });

      if (!exists) {
        const newEvent = new CompanyEvent({
          title: holiday.title,
          description: holiday.description,
          start: holiday.start,
          end: holiday.end,
          type: 'holiday',
          targetLocation: 'country',
          targetValue: country,
          googleEventId: holiday.googleEventId,
          createdBy: 'Google Calendar Sync',
        });
        await newEvent.save();
        importedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} holidays for ${country}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

