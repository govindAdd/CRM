import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { getAllAttendance } from '../../store/attendanceSlice';

export const useGetAllAttendance = () => {
  const dispatch = useDispatch();
  const { records, pagination, isLoading, error } = useSelector((state) => state.attendance);

  const fetchAttendance = useCallback((params) => {
    dispatch(getAllAttendance(params));
  }, [dispatch]);

  return { records, pagination, isLoading, error, fetchAttendance };
}; 