import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { Form, Button } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/TaskPopup.css'; 
import React from 'react';

const TaskPopup = ({
    showPopup,
    togglePopup,
    isEditing,
    activeView,
    singularLabels,
    currentTask,
    setCurrentTask,
    handleChange,
    handleSubmit
}) => {
    return (
        <AnimatePresence>
            {showPopup && (
                <motion.div
                    className="popup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="popup frutiger-aero-popup"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button className="popup-close" onClick={togglePopup}>
                            <i className="bi bi-x x"></i>
                        </button>
                        <h3 className="mb-3">
                            {isEditing
                                ? `Edit ${singularLabels[activeView]}`
                                : `Add New ${singularLabels[activeView]}`}
                        </h3>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="aero-label">Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={currentTask.title}
                                    onChange={handleChange}
                                    required
                                    className="aero-input"
                                />
                            </Form.Group>

                            {(activeView === 'todo' || activeView === 'dailies') && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="aero-label">Due Date</Form.Label>
                                    <DatePicker
                                        selected={
                                            currentTask.dueDate ? new Date(currentTask.dueDate) : null
                                        }
                                        onChange={(date) =>
                                            setCurrentTask((prev) => ({
                                                ...prev,
                                                dueDate: date
                                            }))
                                        }
                                        dateFormat="dd.MM.yyyy"
                                        className="form-control aero-input"
                                        calendarClassName="aero-calendar"
                                    />
                                </Form.Group>
                            )}

                            {activeView === 'dailies' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="aero-label">Estimated Time (hours)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="estimatedTime"
                                            value={currentTask.estimatedTime || ''}
                                            min={0}
                                            max={24}
                                            onChange={handleChange}
                                            className="aero-input"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="aero-label">Due Time</Form.Label>
                                        <DatePicker
                                            selected={currentTask.dueTime ? new Date(`1970-01-01T${currentTask.dueTime}`) : null}
                                            onChange={(date) => {
                                                const timeString = date?.toLocaleTimeString('ro-RO', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                                setCurrentTask((prev) => ({ ...prev, dueTime: timeString }));
                                            }}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            dateFormat="HH:mm"
                                            timeFormat="HH:mm"
                                            timeCaption="Select Time"
                                            className="form-control aero-input aero-timepicker"
                                            calendarClassName="aero-calendar"
                                        />
                                    </Form.Group>
                                </>
                            )}

                            {activeView === 'goals' && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="aero-label">Progress (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="progress"
                                        value={currentTask.progress}
                                        min={0}
                                        max={100}
                                        onChange={handleChange}
                                        className="aero-input"
                                    />
                                </Form.Group>
                            )}

                            <Button type="submit" variant="primary" className="w-100">
                                {isEditing ? 'Save Changes' : `Add ${singularLabels[activeView]}`}
                            </Button>
                        </Form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskPopup;
