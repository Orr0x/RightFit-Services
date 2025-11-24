# Maintenance Service API Development

## Overview

This document provides the complete implementation of the RightFit Services Maintenance API, providing comprehensive functionality for customer management, work order processing, contractor management, and specialized maintenance operations.

## Service Architecture

### 1. Maintenance Service Structure

#### Project Structure

```
apps/
├── web-maintenance/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── customer.controller.js
│   │   │   ├── workOrder.controller.js
│   │   │   ├── property.controller.js
│   │   │   ├── contract.controller.js
│   │   │   ├── contractor.controller.js
│   │   │   ├── technician.controller.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── financial.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── technician.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── services/
│   │   │   ├── customer.service.js
│   │   │   ├── workOrder.service.js
│   │   │   ├── property.service.js
│   │   │   ├── contract.service.js
│   │   │   ├── contractor.service.js
│   │   │   ├── technician.service.js
│   │   │   ├── inventory.service.js
│   │   │   ├── scheduling.service.js
│   │   │   ├── financial.service.js
│   │   │   └── notification.service.js
│   │   ├── models/
│   │   │   ├── Customer.model.js
│   │   │   ├── Property.model.js
│   │   │   ├── WorkOrder.model.js
│   │   │   ├── MaintenanceContract.model.js
│   │   │   ├── Contractor.model.js
│   │   │   ├── Technician.model.js
│   │   │   ├── Skill.model.js
│   │   │   ├── Inventory.model.js
│   │   │   ├── WorkOrderPhoto.model.js
│   │   │   ├── CustomerAccount.model.js
│   │   │   ├── WorkOrderHistory.model.js
│   │   │   └── PartUsage.model.js
│   │   ├── utils/
│   │   │   ├── database.util.js
│   │   │   ├── validation.util.js
│   │   │   ├── email.util.js
│   │   │   ├── fileUpload.util.js
│   │   │   ├── scheduling.util.js
│   │   │   ├── geolocation.util.js
│   │   │   └── logger.util.js
│   │   ├── config/
│   │   │   ├── database.config.js
│   │   │   ├── auth.config.js
│   │   │   ├── email.config.js
│   │   │   ├── fileUpload.config.js
│   │   │   ├── maps.config.js
│   │   │   └── app.config.js
│   │   ├── routes/
│   │   │   ├── customer.routes.js
│   │   │   ├── workOrder.routes.js
│   │   │   ├── property.routes.js
│   │   │   ├── contract.routes.js
│   │   │   ├── contractor.routes.js
│   │   │   ├── technician.routes.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── financial.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── validators/
│   │   │   ├── customer.validator.js
│   │   │   ├── workOrder.validator.js
│   │   │   ├── property.validator.js
│   │   │   ├── contract.validator.js
│   │   │   ├── technician.validator.js
│   │   │   └── financial.validator.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── docs/
│   │   ├── api.md
│   │   └── deployment.md
│   ├── uploads/
│   │   └── work-orders/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── docker-compose.yml
```

### 2. Work Order Management Implementation

#### `apps/web-maintenance/src/services/workOrder.service.js`

```javascript
const WorkOrder = require('../models/WorkOrder.model');
const Customer = require('../models/Customer.model');
const Property = require('../models/Property.model');
const Technician = require('../models/Technician.model');
const SchedulingService = require('./scheduling.service');
const GeolocationUtil = require('../utils/geolocation.util');
const logger = require('../utils/logger.util');
const NotificationService = require('./notification.service');
const InventoryService = require('./inventory.service');

class WorkOrderService {
  async getWorkOrders(filters = {}, user) {
    try {
      // Apply role-based filtering
      if (user.role === 'CUSTOMER') {
        filters.customerId = user.customerId;
      } else if (user.role === 'TECHNICIAN') {
        filters.assignedTechnicianId = user.technicianId;
      }

      const workOrders = await WorkOrder.list(filters);
      return workOrders;
    } catch (error) {
      logger.error('Error fetching work orders:', error);
      throw error;
    }
  }

  async countWorkOrders(filters = {}, user) {
    try {
      // Apply role-based filtering
      if (user.role === 'CUSTOMER') {
        filters.customerId = user.customerId;
      } else if (user.role === 'TECHNICIAN') {
        filters.assignedTechnicianId = user.technicianId;
      }

      const count = await WorkOrder.count(filters);
      return count;
    } catch (error) {
      logger.error('Error counting work orders:', error);
      throw error;
    }
  }

  async getWorkOrderById(workOrderId, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);

      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      this.validateWorkOrderAccess(workOrder, user);

      return workOrder;
    } catch (error) {
      logger.error('Error fetching work order:', error);
      throw error;
    }
  }

  async createWorkOrder(workOrderData, user) {
    try {
      // Validate permissions
      if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only customers, admins, and employees can create work orders',
          statusCode: 403
        };
      }

      // Set customer ID if creating as customer
      if (user.role === 'CUSTOMER') {
        workOrderData.customerId = user.customerId;
      }

      // Validate customer and property
      await this.validateWorkOrderPrerequisites(workOrderData);

      // Calculate estimated duration and cost
      if (!workOrderData.durationHours) {
        workOrderData.durationHours = await this.calculateEstimatedDuration(workOrderData);
      }

      if (!workOrderData.estimatedCost) {
        workOrderData.estimatedCost = await this.calculateEstimatedCost(workOrderData);
      }

      // Generate work order number
      workOrderData.workOrderNumber = await this.generateWorkOrderNumber();

      // Set default priority if not provided
      workOrderData.priority = workOrderData.priority || 'MEDIUM';

      const workOrder = await WorkOrder.create(workOrderData);
      logger.info(`Work order created: ${workOrder.id} - ${workOrder.workOrderNumber}`);

      // Send notifications
      await NotificationService.sendWorkOrderCreatedNotification(workOrder);

      return workOrder;
    } catch (error) {
      logger.error('Error creating work order:', error);
      throw error;
    }
  }

  async updateWorkOrder(workOrderId, updateData, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      this.validateWorkOrderModificationAccess(workOrder, user);

      // Validate scheduling changes
      if (updateData.scheduledDate || updateData.durationHours) {
        const updatedWorkOrder = { ...workOrder, ...updateData };
        await SchedulingService.validateWorkOrderSchedule(updatedWorkOrder);
      }

      const updatedWorkOrder = await WorkOrder.update(workOrderId, updateData);
      logger.info(`Work order updated: ${workOrderId}`);

      // Send notifications for significant changes
      if (this.shouldSendUpdateNotification(updateData)) {
        await NotificationService.sendWorkOrderUpdatedNotification(updatedWorkOrder);
      }

      return updatedWorkOrder;
    } catch (error) {
      logger.error('Error updating work order:', error);
      throw error;
    }
  }

  async assignTechnician(workOrderId, technicianId, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only admins and employees can assign technicians',
          statusCode: 403
        };
      }

      // Validate technician availability and skills
      const technician = await Technician.findById(technicianId);
      if (!technician || !technician.is_active) {
        throw {
          error: 'TECHNICIAN_NOT_AVAILABLE',
          message: 'Technician not found or not active',
          statusCode: 400
        };
      }

      // Validate technician skills match work order requirements
      await this.validateTechnicianSkills(workOrder, technicianId);

      // Check for scheduling conflicts
      const hasConflict = await SchedulingService.checkTechnicianAvailability(
        technicianId,
        workOrder.scheduledDate,
        workOrder.durationHours,
        workOrderId
      );

      if (hasConflict) {
        throw {
          error: 'TECHNICIAN_NOT_AVAILABLE',
          message: 'Technician is not available at the requested time',
          statusCode: 409
        };
      }

      const updatedWorkOrder = await WorkOrder.update(workOrderId, {
        assignedTechnicianId: technicianId,
        status: 'ASSIGNED',
        assignedAt: new Date()
      });

      logger.info(`Work order ${workOrderId} assigned to technician ${technicianId}`);

      // Send notifications
      await NotificationService.sendWorkOrderAssignedNotification(updatedWorkOrder, technician);

      return updatedWorkOrder;
    } catch (error) {
      logger.error('Error assigning technician:', error);
      throw error;
    }
  }

  async updateWorkOrderStatus(workOrderId, status, user, notes = null) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions for status updates
      this.validateWorkOrderStatusUpdateAccess(workOrder, status, user);

      const updateData = { status };

      // Add timestamps and user info based on status
      switch (status) {
        case 'IN_PROGRESS':
          updateData.startedAt = new Date();
          updateData.startedBy = user.id;
          updateData.actualStartTime = new Date();
          break;
        case 'COMPLETED':
          updateData.completedAt = new Date();
          updateData.completedBy = user.id;
          updateData.actualEndTime = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          updateData.cancelledBy = user.id;
          updateData.cancelReason = notes;
          break;
        case 'ON_HOLD':
          updateData.onHoldAt = new Date();
          updateData.onHoldReason = notes;
          break;
      }

      const updatedWorkOrder = await WorkOrder.update(workOrderId, updateData);
      logger.info(`Work order ${workOrderId} status updated to ${status}`);

      // Handle post-completion tasks
      if (status === 'COMPLETED') {
        await this.handleWorkOrderCompletion(updatedWorkOrder, user);
      }

      // Send notifications
      await NotificationService.sendWorkOrderStatusUpdateNotification(updatedWorkOrder, status);

      return updatedWorkOrder;
    } catch (error) {
      logger.error('Error updating work order status:', error);
      throw error;
    }
  }

  async completeWorkOrder(workOrderId, completionData, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only technicians, admins, and employees can complete work orders',
          statusCode: 403
        };
      }

      // Technician can only complete work orders assigned to them
      if (user.role === 'TECHNICIAN' && workOrder.assigned_technician_id !== user.technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'You can only complete work orders assigned to you',
          statusCode: 403
        };
      }

      // Update work order with completion data
      const updateData = {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: user.id,
        actualEndTime: new Date(),
        actualDuration: completionData.actualDuration,
        actualCost: completionData.actualCost,
        completionNotes: completionData.completionNotes,
        technicianRating: completionData.technicianRating
      };

      const updatedWorkOrder = await WorkOrder.update(workOrderId, updateData);

      // Handle parts usage
      if (completionData.partsUsed && completionData.partsUsed.length > 0) {
        await this.processPartsUsage(workOrderId, completionData.partsUsed, user);
      }

      // Handle work order photos
      if (completionData.photos && completionData.photos.length > 0) {
        await this.processWorkOrderPhotos(workOrderId, completionData.photos, user);
      }

      // Create work order history entry
      await this.createWorkOrderHistoryEntry(workOrderId, 'COMPLETED', completionData.completionNotes, user);

      // Send notifications
      await NotificationService.sendWorkOrderCompletedNotification(updatedWorkOrder);

      logger.info(`Work order completed: ${workOrderId}`);

      return updatedWorkOrder;
    } catch (error) {
      logger.error('Error completing work order:', error);
      throw error;
    }
  }

  async rescheduleWorkOrder(workOrderId, newScheduledDate, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      this.validateWorkOrderModificationAccess(workOrder, user);

      // Validate new schedule
      const updatedWorkOrder = { ...workOrder, scheduledDate: newScheduledDate };
      await SchedulingService.validateWorkOrderSchedule(updatedWorkOrder);

      // Check technician availability if assigned
      if (workOrder.assignedTechnicianId) {
        const hasConflict = await SchedulingService.checkTechnicianAvailability(
          workOrder.assignedTechnicianId,
          newScheduledDate,
          workOrder.durationHours,
          workOrderId
        );

        if (hasConflict) {
          throw {
            error: 'SCHEDULE_CONFLICT',
            message: 'Technician is not available at the new scheduled time',
            statusCode: 409
          };
        }
      }

      const updatedWorkOrder = await WorkOrder.update(workOrderId, {
        scheduledDate: newScheduledDate,
        rescheduledAt: new Date(),
        rescheduledBy: user.id,
        rescheduledReason: user.reason || 'Rescheduled by user'
      });

      // Create work order history entry
      await this.createWorkOrderHistoryEntry(
        workOrderId,
        'RESCHEDULED',
        `Rescheduled from ${workOrder.scheduledDate} to ${newScheduledDate}`,
        user
      );

      logger.info(`Work order ${workOrderId} rescheduled to ${newScheduledDate}`);

      // Send notifications
      await NotificationService.sendWorkOrderRescheduledNotification(updatedWorkOrder);

      return updatedWorkOrder;
    } catch (error) {
      logger.error('Error rescheduling work order:', error);
      throw error;
    }
  }

  async getAvailableTechnicians(workOrderData, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only admins and employees can view available technicians',
          statusCode: 403
        };
      }

      const availableTechnicians = await SchedulingService.getAvailableTechnicians(
        workOrderData.scheduledDate,
        workOrderData.durationHours,
        workOrderData.requiredSkills || [],
        workOrderData.priority || 'MEDIUM'
      );

      return availableTechnicians;
    } catch (error) {
      logger.error('Error getting available technicians:', error);
      throw error;
    }
  }

  async getWorkOrderSchedule(startDate, endDate, user) {
    try {
      // Apply role-based filtering
      let filters = {
        dateFrom: startDate,
        dateTo: endDate,
        status: ['ASSIGNED', 'IN_PROGRESS']
      };

      if (user.role === 'CUSTOMER') {
        filters.customerId = user.customerId;
      } else if (user.role === 'TECHNICIAN') {
        filters.assignedTechnicianId = user.technicianId;
      }

      const workOrders = await WorkOrder.list(filters);
      return workOrders;
    } catch (error) {
      logger.error('Error getting work order schedule:', error);
      throw error;
    }
  }

  async getWorkOrderHistory(workOrderId, user) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw {
          error: 'WORK_ORDER_NOT_FOUND',
          message: 'Work order not found',
          statusCode: 404
        };
      }

      // Check permissions
      this.validateWorkOrderAccess(workOrder, user);

      const history = await WorkOrder.getHistory(workOrderId);
      return history;
    } catch (error) {
      logger.error('Error getting work order history:', error);
      throw error;
    }
  }

  async validateWorkOrderAccess(workOrder, user) {
    try {
      if (user.role === 'CUSTOMER') {
        if (workOrder.customer_id !== user.customerId) {
          throw {
            error: 'ACCESS_DENIED',
            message: 'Access denied: You can only view your own work orders',
            statusCode: 403
          };
        }
      } else if (user.role === 'TECHNICIAN') {
        if (workOrder.assigned_technician_id && workOrder.assigned_technician_id !== user.technicianId) {
          throw {
            error: 'ACCESS_DENIED',
            message: 'Access denied: You can only view work orders assigned to you',
            statusCode: 403
          };
        }
      }
      // Admin and Employee roles have full access
    } catch (error) {
      logger.error('Error validating work order access:', error);
      throw error;
    }
  }

  async validateWorkOrderModificationAccess(workOrder, user) {
    try {
      if (user.role === 'CUSTOMER') {
        if (workOrder.customer_id !== user.customerId) {
          throw {
            error: 'ACCESS_DENIED',
            message: 'Access denied: You can only modify your own work orders',
            statusCode: 403
          };
        }

        // Customers can't modify work orders that are already in progress or completed
        if (['IN_PROGRESS', 'COMPLETED'].includes(workOrder.status)) {
          throw {
            error: 'WORK_ORDER_NOT_MODIFIABLE',
            message: 'Cannot modify work order that is already in progress or completed',
            statusCode: 400
          };
        }
      }
      // Admin and Employee roles have full modification access
    } catch (error) {
      logger.error('Error validating work order modification access:', error);
      throw error;
    }
  }

  validateWorkOrderStatusUpdateAccess(workOrder, status, user) {
    try {
      switch (user.role) {
        case 'CUSTOMER':
          // Customers can only cancel their own work orders
          if (status !== 'CANCELLED' || workOrder.customer_id !== user.customerId) {
            throw {
              error: 'ACCESS_DENIED',
              message: 'Access denied: Customers can only cancel their own work orders',
              statusCode: 403
            };
          }
          break;

        case 'TECHNICIAN':
          // Technicians can only update status of work orders assigned to them
          if (workOrder.assigned_technician_id !== user.technicianId) {
            throw {
              error: 'ACCESS_DENIED',
              message: 'Access denied: You can only update work orders assigned to you',
              statusCode: 403
            };
          }
          // Technicians can only move to in_progress or completed
          if (!['IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].includes(status)) {
            throw {
              error: 'INVALID_STATUS_TRANSITION',
              message: 'Technicians can only set work order status to in_progress, completed, or on hold',
              statusCode: 400
            };
          }
          break;

        case 'ADMIN':
        case 'EMPLOYEE':
          // Admins and employees can update any work order status
          break;

        default:
          throw {
            error: 'ACCESS_DENIED',
            message: 'Invalid user role',
            statusCode: 403
          };
      }
    } catch (error) {
      logger.error('Error validating work order status update access:', error);
      throw error;
    }
  }

  async validateWorkOrderPrerequisites(workOrderData) {
    try {
      // Validate customer exists
      const customer = await Customer.findById(workOrderData.customerId);
      if (!customer) {
        throw {
          error: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
          statusCode: 400
        };
      }

      // Validate property exists and belongs to customer
      const property = await Property.findById(workOrderData.propertyId);
      if (!property || property.owner_id !== workOrderData.customerId) {
        throw {
          error: 'PROPERTY_NOT_FOUND',
          message: 'Property not found or does not belong to customer',
          statusCode: 400
        };
      }

      return true;
    } catch (error) {
      logger.error('Error validating work order prerequisites:', error);
      throw error;
    }
  }

  async validateTechnicianSkills(workOrder, technicianId) {
    try {
      if (!workOrder.requiredSkills || workOrder.requiredSkills.length === 0) {
        return true; // No specific skills required
      }

      const technician = await Technician.findById(technicianId);
      if (!technician) {
        throw {
          error: 'TECHNICIAN_NOT_FOUND',
          message: 'Technician not found',
          statusCode: 400
        };
      }

      // Check if technician has required skills
      const technicianSkills = await Technician.getSkills(technicianId);
      const requiredSkills = workOrder.requiredSkills;

      const hasAllSkills = requiredSkills.every(requiredSkill =>
        technicianSkills.some(techSkill => techSkill.skill_name === requiredSkill)
      );

      if (!hasAllSkills) {
        throw {
          error: 'TECHNICIAN_MISSING_SKILLS',
          message: 'Technician does not have required skills for this work order',
          statusCode: 400
        };
      }

      return true;
    } catch (error) {
      logger.error('Error validating technician skills:', error);
      throw error;
    }
  }

  async generateWorkOrderNumber() {
    try {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

      return `WO-${dateStr}-${randomStr}`;
    } catch (error) {
      logger.error('Error generating work order number:', error);
      return `WO-${Date.now()}`;
    }
  }

  async calculateEstimatedDuration(workOrderData) {
    try {
      // Get property details
      const property = await Property.findById(workOrderData.propertyId);

      // Base duration calculation based on work order type and property size
      let baseHours = 2; // Default 2 hours

      if (workOrderData.workOrderType === 'EMERGENCY') {
        baseHours *= 1.5; // Emergency jobs take 50% more time
      } else if (workOrderData.workOrderType === 'COMPLEX') {
        baseHours *= 2; // Complex jobs take double time
      }

      // Adjust for property size
      if (property.square_footage) {
        if (property.square_footage > 3000) {
          baseHours *= 1.3; // 30% more time for large properties
        } else if (property.square_footage < 1000) {
          baseHours *= 0.8; // 20% less time for small properties
        }
      }

      // Adjust for number of units in multi-family properties
      if (property.property_type === 'multi_family' && property.units) {
        baseHours *= Math.min(property.units * 0.5, 2); // Scale with units but cap at double
      }

      return Math.max(baseHours, 0.5); // Minimum 30 minutes
    } catch (error) {
      logger.error('Error calculating work order duration:', error);
      return 2; // Default to 2 hours on error
    }
  }

  async calculateEstimatedCost(workOrderData) {
    try {
      // Get work order type base rates
      const baseRates = {
        'ROUTINE': 75,    // $75 per hour
        'EMERGENCY': 150, // $150 per hour
        'COMPLEX': 100,   // $100 per hour
        'INSPECTION': 50  // $50 per hour
      };

      const hourlyRate = baseRates[workOrderData.workOrderType] || baseRates['ROUTINE'];
      const estimatedHours = workOrderData.durationHours || 2;

      let baseCost = hourlyRate * estimatedHours;

      // Add emergency surcharge
      if (workOrderData.workOrderType === 'EMERGENCY') {
        baseCost += 100; // $100 emergency call-out fee
      }

      // Add after-hours surcharge
      const scheduledHour = new Date(workOrderData.scheduledDate).getHours();
      if (scheduledHour < 8 || scheduledHour > 18) {
        baseCost *= 1.25; // 25% after-hours surcharge
      }

      // Add weekend surcharge
      const scheduledDay = new Date(workOrderData.scheduledDate).getDay();
      if (scheduledDay === 0 || scheduledDay === 6) { // Sunday or Saturday
        baseCost *= 1.5; // 50% weekend surcharge
      }

      // Round to nearest dollar
      return Math.round(baseCost);
    } catch (error) {
      logger.error('Error calculating work order cost:', error);
      return 150; // Default to $150 on error
    }
  }

  shouldSendUpdateNotification(updateData) {
    // Send notification for significant changes
    const significantFields = [
      'status', 'scheduledDate', 'assignedTechnicianId', 'priority', 'estimatedCost'
    ];

    return significantFields.some(field => updateData[field] !== undefined);
  }

  async handleWorkOrderCompletion(workOrder, user) {
    try {
      // Create invoice for completed work order
      if (workOrder.actualCost && workOrder.actualCost > 0) {
        // Create financial transaction for the completed work order
        const transactionData = {
          customerId: workOrder.customer_id,
          transactionType: 'INVOICE_SENT',
          amount: workOrder.actualCost,
          currency: 'USD',
          workOrderId: workOrder.id,
          propertyId: workOrder.property_id,
          description: `Invoice for work order: ${workOrder.workOrderNumber} - ${workOrder.title}`,
          dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
          status: 'PENDING'
        };

        // Create invoice transaction (would integrate with financial service)
        await this.createWorkOrderInvoice(transactionData);
      }

      // Update technician performance metrics if rating provided
      if (workOrder.technicianRating) {
        await this.updateTechnicianPerformance(workOrder.assignedTechnicianId, workOrder.technicianRating);
      }

      // Update property maintenance history
      await this.updatePropertyMaintenanceHistory(workOrder);

      logger.info(`Work order ${workOrder.id} completion handled successfully`);
    } catch (error) {
      logger.error('Error handling work order completion:', error);
      // Don't throw error here as it shouldn't fail the completion process
    }
  }

  async createWorkOrderInvoice(transactionData) {
    // This would integrate with the financial service
    // For now, we'll just log the invoice creation
    logger.info(`Invoice created for work order: ${transactionData.workOrderId}`);
  }

  async updateTechnicianPerformance(technicianId, rating) {
    // This would update technician performance metrics
    logger.info(`Technician ${technicianId} rating updated to ${rating}`);
  }

  async updatePropertyMaintenanceHistory(workOrder) {
    // This would update property maintenance history
    logger.info(`Property ${workOrder.property_id} maintenance history updated`);
  }

  async createWorkOrderHistoryEntry(workOrderId, action, notes, user) {
    try {
      await WorkOrder.createHistoryEntry(workOrderId, action, notes, user.id, user.role);
    } catch (error) {
      logger.error('Error creating work order history entry:', error);
      // Don't throw error here as it shouldn't fail the main operation
    }
  }

  async processPartsUsage(workOrderId, partsUsed, user) {
    try {
      for (const part of partsUsed) {
        await InventoryService.usePart(part.partId, part.quantity, workOrderId, user);
      }
    } catch (error) {
      logger.error('Error processing parts usage:', error);
      throw error;
    }
  }

  async processWorkOrderPhotos(workOrderId, photos, user) {
    try {
      for (const photoData of photos) {
        await WorkOrder.createPhoto(workOrderId, photoData, user.id);
      }
    } catch (error) {
      logger.error('Error processing work order photos:', error);
      // Don't throw error here as it shouldn't fail the completion process
    }
  }
}

module.exports = new WorkOrderService();
```

### 3. Technician Management Implementation

#### `apps/web-maintenance/src/services/technician.service.js`

```javascript
const Technician = require('../models/Technician.model');
const Skill = require('../models/Skill.model');
const WorkOrder = require('../models/WorkOrder.model');
const SchedulingService = require('./scheduling.service');
const GeolocationUtil = require('../utils/geolocation.util');
const logger = require('../utils/logger.util');

class TechnicianService {
  async getTechnicians(filters = {}, user) {
    try {
      // Apply role-based filtering
      if (user.role === 'TECHNICIAN') {
        filters.technicianId = user.technicianId;
      }

      const technicians = await Technician.list(filters);
      return technicians;
    } catch (error) {
      logger.error('Error fetching technicians:', error);
      throw error;
    }
  }

  async countTechnicians(filters = {}, user) {
    try {
      // Apply role-based filtering
      if (user.role === 'TECHNICIAN') {
        filters.technicianId = user.technicianId;
      }

      const count = await Technician.count(filters);
      return count;
    } catch (error) {
      logger.error('Error counting technicians:', error);
      throw error;
    }
  }

  async getTechnicianById(technicianId, user) {
    try {
      const technician = await Technician.findById(technicianId);

      if (!technician) {
        throw {
          error: 'TECHNICIAN_NOT_FOUND',
          message: 'Technician not found',
          statusCode: 404
        };
      }

      // Check permissions
      if (user.role === 'TECHNICIAN' && user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied: You can only view your own profile',
          statusCode: 403
        };
      }

      // Get technician skills
      const skills = await Technician.getSkills(technicianId);
      technician.skills = skills;

      // Get technician availability
      const availability = await Technician.getAvailability(technicianId);
      technician.availability = availability;

      return technician;
    } catch (error) {
      logger.error('Error fetching technician:', error);
      throw error;
    }
  }

  async createTechnician(technicianData, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only admins and employees can create technicians',
          statusCode: 403
        };
      }

      // Check if technician already exists
      const existingTechnician = await Technician.findByEmail(technicianData.email);
      if (existingTechnician) {
        throw {
          error: 'TECHNICIAN_EXISTS',
          message: 'A technician with this email already exists',
          statusCode: 409
        };
      }

      const technician = await Technician.create(technicianData);
      logger.info(`Technician created: ${technician.email}`);

      // Add initial skills if provided
      if (technicianData.skills && technicianData.skills.length > 0) {
        await this.addTechnicianSkills(technician.id, technicianData.skills);
      }

      // Set initial availability if provided
      if (technicianData.availability) {
        await this.setTechnicianAvailability(technician.id, technicianData.availability);
      }

      return technician;
    } catch (error) {
      logger.error('Error creating technician:', error);
      throw error;
    }
  }

  async updateTechnician(technicianId, updateData, user) {
    try {
      const technician = await Technician.findById(technicianId);
      if (!technician) {
        throw {
          error: 'TECHNICIAN_NOT_FOUND',
          message: 'Technician not found',
          statusCode: 404
        };
      }

      // Check permissions
      if (user.role === 'TECHNICIAN' && user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied: You can only update your own profile',
          statusCode: 403
        };
      }

      const updatedTechnician = await Technician.update(technicianId, updateData);
      logger.info(`Technician updated: ${technicianId}`);

      return updatedTechnician;
    } catch (error) {
      logger.error('Error updating technician:', error);
      throw error;
    }
  }

  async getAvailableTechnicians(scheduledDate, durationHours, requiredSkills = [], location = null) {
    try {
      const availableTechnicians = await SchedulingService.getAvailableTechnicians(
        scheduledDate,
        durationHours,
        requiredSkills,
        location
      );

      return availableTechnicians;
    } catch (error) {
      logger.error('Error getting available technicians:', error);
      throw error;
    }
  }

  async getTechnicianSchedule(technicianId, startDate, endDate, user) {
    try {
      // Check permissions
      if (user.role === 'TECHNICIAN' && user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied: You can only view your own schedule',
          statusCode: 403
        };
      }

      const schedule = await Technician.getSchedule(technicianId, startDate, endDate);
      return schedule;
    } catch (error) {
      logger.error('Error getting technician schedule:', error);
      throw error;
    }
  }

  async addTechnicianSkills(technicianId, skills, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only admins and employees can modify technician skills',
          statusCode: 403
        };
      }

      for (const skillData of skills) {
        await Technician.addSkill(technicianId, skillData.skillId, skillData.level, skillData.certification);
      }

      logger.info(`Skills added for technician: ${technicianId}`);
    } catch (error) {
      logger.error('Error adding technician skills:', error);
      throw error;
    }
  }

  async removeTechnicianSkill(technicianId, skillId, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only admins and employees can modify technician skills',
          statusCode: 403
        };
      }

      await Technician.removeSkill(technicianId, skillId);
      logger.info(`Skill removed from technician: ${technicianId}`);
    } catch (error) {
      logger.error('Error removing technician skill:', error);
      throw error;
    }
  }

  async setTechnicianAvailability(technicianId, availability, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE' && user.role !== 'TECHNICIAN') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied',
          statusCode: 403
        };
      }

      // Technicians can only set their own availability
      if (user.role === 'TECHNICIAN' && user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'You can only set your own availability',
          statusCode: 403
        };
      }

      await Technician.setAvailability(technicianId, availability);
      logger.info(`Availability set for technician: ${technicianId}`);
    } catch (error) {
      logger.error('Error setting technician availability:', error);
      throw error;
    }
  }

  async updateTechnicianLocation(technicianId, location, user) {
    try {
      // Check permissions
      if (user.role !== 'TECHNICIAN') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Only technicians can update their location',
          statusCode: 403
        };
      }

      if (user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'You can only update your own location',
          statusCode: 403
        };
      }

      await Technician.updateLocation(technicianId, location);
      logger.info(`Location updated for technician: ${technicianId}`);
    } catch (error) {
      logger.error('Error updating technician location:', error);
      throw error;
    }
  }

  async getNearbyTechnicians(latitude, longitude, radius, requiredSkills = []) {
    try {
      const nearbyTechnicians = await Technician.findNearby(latitude, longitude, radius, requiredSkills);
      return nearbyTechnicians;
    } catch (error) {
      logger.error('Error getting nearby technicians:', error);
      throw error;
    }
  }

  async getTechnicianPerformance(technicianId, period = 'month', user) {
    try {
      // Check permissions
      if (user.role === 'TECHNICIAN' && user.technicianId !== technicianId) {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied: You can only view your own performance',
          statusCode: 403
        };
      }

      const performance = await Technician.getPerformanceMetrics(technicianId, period);
      return performance;
    } catch (error) {
      logger.error('Error getting technician performance:', error);
      throw error;
    }
  }

  async updateTechnicianPerformance(technicianId, rating, feedback, user) {
    try {
      // Check permissions
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE' && user.role !== 'CUSTOMER') {
        throw {
          error: 'ACCESS_DENIED',
          message: 'Access denied',
          statusCode: 403
        };
      }

      await Technician.updatePerformance(technicianId, rating, feedback, user.id);
      logger.info(`Performance updated for technician: ${technicianId}`);
    } catch (error) {
      logger.error('Error updating technician performance:', error);
      throw error;
    }
  }

  async validateTechnicianSkills(workOrderSkills, technicianId) {
    try {
      const technicianSkills = await Technician.getSkills(technicianId);
      const technicianSkillNames = technicianSkills.map(skill => skill.skill_name);

      return workOrderSkills.every(requiredSkill =>
        technicianSkillNames.includes(requiredSkill)
      );
    } catch (error) {
      logger.error('Error validating technician skills:', error);
      throw error;
    }
  }

  async getTechnicianStats(user) {
    try {
      // Apply role-based filtering
      let technicianIdFilter = null;
      if (user.role === 'TECHNICIAN') {
        technicianIdFilter = user.technicianId;
      }

      const stats = await Technician.getStats(technicianIdFilter);
      return stats;
    } catch (error) {
      logger.error('Error getting technician stats:', error);
      throw error;
    }
  }

  async searchTechnicians(query, filters = {}, user) {
    try {
      // Apply role-based filtering
      if (user.role === 'TECHNICIAN') {
        filters.technicianId = user.technicianId;
      }

      const searchFilters = {
        ...filters,
        search: query,
        limit: 20
      };

      const technicians = await Technician.list(searchFilters);
      return technicians;
    } catch (error) {
      logger.error('Error searching technicians:', error);
      throw error;
    }
  }
}

module.exports = new TechnicianService();
```

### 4. Specialized Maintenance Features

#### `apps/web-maintenance/src/services/scheduling.service.js`

```javascript
const Technician = require('../models/Technician.model');
const WorkOrder = require('../models/WorkOrder.model');
const GeolocationUtil = require('../utils/geolocation.util');
const logger = require('../utils/logger.util');

class SchedulingService {
  async getAvailableTechnicians(scheduledDate, durationHours, requiredSkills = [], location = null, priority = 'MEDIUM') {
    try {
      // Get all active technicians
      const activeTechnicians = await Technician.list({ isActive: true });

      const availableTechnicians = [];

      for (const technician of activeTechnicians) {
        // Check technician availability
        const isAvailable = await this.checkTechnicianAvailability(
          technician.id,
          scheduledDate,
          durationHours
        );

        if (!isAvailable) {
          continue;
        }

        // Check skill requirements
        const hasRequiredSkills = await this.checkTechnicianSkills(
          technician.id,
          requiredSkills
        );

        if (!hasRequiredSkills) {
          continue;
        }

        // Check location proximity if location provided
        let distance = null;
        if (location && technician.latitude && technician.longitude) {
          distance = GeolocationUtil.calculateDistance(
            location.latitude,
            location.longitude,
            technician.latitude,
            technician.longitude
          );

          // Filter technicians within reasonable distance (50 miles)
          if (distance > 50) {
            continue;
          }
        }

        // Calculate priority score
        const priorityScore = await this.calculateTechnicianPriorityScore(
          technician,
          requiredSkills,
          priority,
          distance
        );

        availableTechnicians.push({
          ...technician,
          distance,
          priorityScore,
          availability: 'AVAILABLE'
        });
      }

      // Sort by priority score (highest first)
      availableTechnicians.sort((a, b) => b.priorityScore - a.priorityScore);

      return availableTechnicians;
    } catch (error) {
      logger.error('Error getting available technicians:', error);
      throw error;
    }
  }

  async checkTechnicianAvailability(technicianId, scheduledDate, durationHours, excludeWorkOrderId = null) {
    try {
      const technicianAvailability = await Technician.getAvailability(technicianId);
      const workOrders = await Technician.getAssignedWorkOrders(technicianId, scheduledDate);

      // Check if scheduled date is within technician's working hours
      const scheduledDateTime = new Date(scheduledDate);
      const dayOfWeek = scheduledDateTime.getDay();
      const scheduledHour = scheduledDateTime.getHours();

      const dayAvailability = technicianAvailability.find(
        availability => availability.day_of_week === dayOfWeek
      );

      if (!dayAvailability || !dayAvailability.is_available) {
        return false;
      }

      const { start_time, end_time } = dayAvailability;
      const scheduledEndTime = new Date(scheduledDateTime.getTime() + (durationHours * 60 * 60 * 1000));

      // Check if scheduled time is within working hours
      const startTime = this.parseTime(start_time);
      const endTime = this.parseTime(end_time);

      if (scheduledHour < startTime.hour || scheduledEndTime.getHours() > endTime.hour) {
        return false;
      }

      // Check for conflicts with existing work orders
      for (const workOrder of workOrders) {
        if (excludeWorkOrderId && workOrder.id === excludeWorkOrderId) {
          continue;
        }

        const workOrderStart = new Date(workOrder.scheduled_date);
        const workOrderEnd = new Date(
          workOrder.scheduled_date.getTime() + (workOrder.duration_hours * 60 * 60 * 1000)
        );

        // Check for time overlap
        if (
          (scheduledDateTime >= workOrderStart && scheduledDateTime < workOrderEnd) ||
          (scheduledEndTime > workOrderStart && scheduledEndTime <= workOrderEnd) ||
          (scheduledDateTime <= workOrderStart && scheduledEndTime >= workOrderEnd)
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error checking technician availability:', error);
      throw error;
    }
  }

  async checkTechnicianSkills(technicianId, requiredSkills) {
    try {
      if (!requiredSkills || requiredSkills.length === 0) {
        return true; // No specific skills required
      }

      const technicianSkills = await Technician.getSkills(technicianId);
      const technicianSkillNames = technicianSkills.map(skill => skill.skill_name);

      return requiredSkills.every(requiredSkill =>
        technicianSkillNames.includes(requiredSkill)
      );
    } catch (error) {
      logger.error('Error checking technician skills:', error);
      throw error;
    }
  }

  async calculateTechnicianPriorityScore(technician, requiredSkills, priority, distance) {
    try {
      let score = 100; // Base score

      // Skill match bonus
      if (requiredSkills && requiredSkills.length > 0) {
        const technicianSkills = await Technician.getSkills(technician.id);
        const skillMatches = requiredSkills.filter(requiredSkill =>
          technicianSkills.some(skill => skill.skill_name === requiredSkill)
        );

        if (skillMatches.length === requiredSkills.length) {
          score += 50; // Perfect skill match
        } else if (skillMatches.length > 0) {
          score += (skillMatches.length / requiredSkills.length) * 25; // Partial skill match
        }
      }

      // Distance penalty
      if (distance !== null) {
        score -= Math.min(distance * 2, 30); // Penalty based on distance, max 30 points
      }

      // Performance rating bonus
      if (technician.average_rating) {
        score += (technician.average_rating / 5) * 20; // Up to 20 points for rating
      }

      // Urgency bonus for high priority work orders
      if (priority === 'HIGH' || priority === 'EMERGENCY') {
        // Favor technicians with good performance for urgent jobs
        if (technician.completed_jobs > 10) {
          score += 15;
        }
      }

      // Availability bonus (technicians with more availability)
      if (technician.availability_score) {
        score += technician.availability_score * 5;
      }

      return Math.max(0, Math.round(score));
    } catch (error) {
      logger.error('Error calculating technician priority score:', error);
      return 50; // Default score on error
    }
  }

  async optimizeTechnicianSchedule(technicianId, workOrderRequests) {
    try {
      const optimizedSchedule = [];
      const currentDate = new Date();

      // Sort work orders by priority
      const sortedWorkOrders = workOrderRequests.sort((a, b) => {
        const priorityOrder = { 'EMERGENCY': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      for (const workOrder of sortedWorkOrders) {
        let scheduledDate = new Date(currentDate);
        let maxDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Look ahead 1 week
        let isScheduled = false;

        while (scheduledDate <= maxDate && !isScheduled) {
          // Check if technician is available at this time
          const isAvailable = await this.checkTechnicianAvailability(
            technicianId,
            scheduledDate,
            workOrder.durationHours
          );

          if (isAvailable) {
            // Check if technician has required skills
            const hasSkills = await this.checkTechnicianSkills(
              technicianId,
              workOrder.requiredSkills
            );

            if (hasSkills) {
              optimizedSchedule.push({
                ...workOrder,
                scheduledDate: scheduledDate.toISOString(),
                technicianId: technicianId
              });
              isScheduled = true;
            }
          }

          // Move to next available time slot
          scheduledDate = this.getNextAvailableTime(scheduledDate, workOrder.durationHours);
        }

        if (!isScheduled) {
          // Work order couldn't be scheduled within the time window
          optimizedSchedule.push({
            ...workOrder,
            scheduledDate: null,
            status: 'UNSCHEDULABLE',
            reason: 'No available time slots within next 7 days'
          });
        }
      }

      return optimizedSchedule;
    } catch (error) {
      logger.error('Error optimizing technician schedule:', error);
      throw error;
    }
  }

  parseTime(timeString) {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      return { hour: hours, minute: minutes || 0 };
    } catch (error) {
      logger.error('Error parsing time string:', error);
      return { hour: 9, minute: 0 }; // Default to 9:00 AM
    }
  }

  getNextAvailableTime(currentTime, durationHours) {
    try {
      const nextTime = new Date(currentTime);
      nextTime.setHours(nextTime.getHours() + Math.ceil(durationHours));

      // Move to next day if past working hours
      if (nextTime.getHours() > 17) {
        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(9, 0, 0, 0); // 9:00 AM next day
      }

      return nextTime;
    } catch (error) {
      logger.error('Error getting next available time:', error);
      return new Date(currentTime.getTime() + (durationHours * 60 * 60 * 1000));
    }
  }

  async getScheduleOptimizationSuggestions(workOrders) {
    try {
      const suggestions = [];

      // Group work orders by location
      const workOrdersByLocation = {};
      workOrders.forEach(workOrder => {
        const locationKey = `${workOrder.city}_${workOrder.state}`;
        if (!workOrdersByLocation[locationKey]) {
          workOrdersByLocation[locationKey] = [];
        }
        workOrdersByLocation[locationKey].push(workOrder);
      });

      // For each location, suggest batch scheduling
      for (const [location, locationWorkOrders] of Object.entries(workOrdersByLocation)) {
        if (locationWorkOrders.length > 1) {
          suggestions.push({
            type: 'BATCH_SCHEDULING',
            location: location,
            workOrders: locationWorkOrders,
            description: `Batch schedule ${locationWorkOrders.length} work orders in ${location} for efficiency`,
            potentialSavings: this.calculateBatchSavings(locationWorkOrders)
          });
        }
      }

      // Suggest technicians with relevant skills
      const workOrdersBySkills = {};
      workOrders.forEach(workOrder => {
        if (workOrder.requiredSkills && workOrder.requiredSkills.length > 0) {
          workOrder.requiredSkills.forEach(skill => {
            if (!workOrdersBySkills[skill]) {
              workOrdersBySkills[skill] = [];
            }
            workOrdersBySkills[skill].push(workOrder);
          });
        }
      });

      for (const [skill, skillWorkOrders] of Object.entries(workOrdersBySkills)) {
        if (skillWorkOrders.length > 1) {
          const availableTechnicians = await Technician.list({
            skillFilter: skill,
            isActive: true
          });

          suggestions.push({
            type: 'SKILL_BASED_ASSIGNMENT',
            skill: skill,
            workOrders: skillWorkOrders,
            availableTechnicians: availableTechnicians,
            description: `Assign ${skillWorkOrders.length} work orders requiring ${skill} to ${availableTechnicians.length} specialized technicians`
          });
        }
      }

      // Suggest urgent work order prioritization
      const urgentWorkOrders = workOrders.filter(wo =>
        ['HIGH', 'EMERGENCY'].includes(wo.priority)
      );

      if (urgentWorkOrders.length > 0) {
        suggestions.push({
          type: 'URGENT_PRIORITIZATION',
          workOrders: urgentWorkOrders,
          description: `Prioritize ${urgentWorkOrders.length} urgent work orders for immediate scheduling`,
          recommendedAction: 'Schedule within 24 hours'
        });
      }

      return suggestions;
    } catch (error) {
      logger.error('Error getting schedule optimization suggestions:', error);
      throw error;
    }
  }

  calculateBatchSavings(workOrders) {
    try {
      // Calculate potential savings from batching work orders by location
      const averageTravelTime = 45; // minutes between locations
      const totalWorkOrders = workOrders.length;

      if (totalWorkOrders <= 1) {
        return 0;
      }

      // Savings: reduce travel time between work orders in same location
      const totalSavings = (totalWorkOrders - 1) * averageTravelTime;
      const savingsInHours = totalSavings / 60;
      const technicianRate = 75; // $75 per hour
      const dollarSavings = savingsInHours * technicianRate;

      return {
        travelTimeSaved: totalSavings,
        hoursSaved: savingsInHours,
        dollarSavings: Math.round(dollarSavings)
      };
    } catch (error) {
      logger.error('Error calculating batch savings:', error);
      return { travelTimeSaved: 0, hoursSaved: 0, dollarSavings: 0 };
    }
  }

  async validateWorkOrderSchedule(workOrder) {
    try {
      const errors = [];

      // Check if scheduled date is in the past
      if (new Date(workOrder.scheduledDate) < new Date()) {
        errors.push('Scheduled date cannot be in the past');
      }

      // Check if scheduled date is too far in the future (more than 1 year)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (new Date(workOrder.scheduledDate) > maxDate) {
        errors.push('Scheduled date cannot be more than 1 year in the future');
      }

      // Check if duration is reasonable
      if (workOrder.durationHours < 0.5 || workOrder.durationHours > 24) {
        errors.push('Duration must be between 0.5 and 24 hours');
      }

      // Check if scheduled time is during working hours (9 AM - 5 PM)
      const scheduledTime = new Date(workOrder.scheduledDate);
      const scheduledHour = scheduledTime.getHours();

      if (scheduledHour < 9 || scheduledHour > 17) {
        errors.push('Scheduled time should be between 9 AM and 5 PM');
      }

      return errors;
    } catch (error) {
      logger.error('Error validating work order schedule:', error);
      throw error;
    }
  }
}

module.exports = new SchedulingService();
```

This comprehensive maintenance service API implementation provides:

1. **Advanced work order management** with detailed scheduling and technician assignment
2. **Specialized technician management** with skills, availability, and performance tracking
3. **Intelligent scheduling system** with availability checking and optimization
4. **Geolocation-based technician assignment** with distance calculations
5. **Skills-based matching** for specialized maintenance requirements
6. **Performance analytics** for technician evaluation
7. **Batch scheduling optimization** for efficiency improvements
8. **Priority-based assignment** for urgent maintenance requests

The service is specifically designed for maintenance operations with features like parts inventory, specialized skills tracking, and emergency response capabilities that are essential for professional maintenance businesses.