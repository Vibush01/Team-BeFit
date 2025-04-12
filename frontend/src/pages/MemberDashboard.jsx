import { useState, useEffect } from 'react';

function MemberDashboard() {
  const [gyms, setGyms] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [bodyConditions, setBodyConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch member data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        console.log('MemberDashboard - User ID:', userId); // Debug log

        if (!token || !userId) {
          throw new Error('Not authenticated. Please log in again.');
        }

        // Fetch gyms where the member is assigned
        const gymsResponse = await fetch('http://localhost:5000/api/gyms/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const gymsData = await gymsResponse.json();
        if (gymsResponse.ok) {
          const memberGyms = gymsData.filter((gym) =>
            gym.members.some((member) => member._id === userId)
          );
          setGyms(memberGyms);
        }

        // Fetch workout plans
        const workoutResponse = await fetch('http://localhost:5000/api/plans/workout/member', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const workoutData = await workoutResponse.json();
        if (workoutResponse.ok) {
          setWorkoutPlans(workoutData);
        }

        // Fetch diet plans
        const dietResponse = await fetch('http://localhost:5000/api/plans/diet/member', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const dietData = await dietResponse.json();
        if (dietResponse.ok) {
          setDietPlans(dietData);
        }

        // Fetch food logs
        const foodResponse = await fetch('http://localhost:5000/api/tracking/food', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const foodData = await foodResponse.json();
        if (foodResponse.ok) {
          setFoodLogs(foodData);
        }

        // Fetch body conditions
        const bodyResponse = await fetch('http://localhost:5000/api/tracking/body', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bodyData = await bodyResponse.json();
        if (bodyResponse.ok) {
          setBodyConditions(bodyData);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Member Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Gyms</h2>
        {gyms.length > 0 ? (
          <div className="space-y-6">
            {gyms.map((gym) => (
              <div key={gym._id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-600">{gym.name}</h3>
                <p className="text-gray-700">Address: {gym.address}</p>
                <h4 className="text-lg font-semibold mt-4">Trainers:</h4>
                {gym.trainers.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {gym.trainers.map((trainer) => (
                      <li key={trainer._id} className="text-gray-700">
                        {trainer.name} ({trainer.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No trainers yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not a member of any gyms yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Workout Plans</h2>
        {workoutPlans.length > 0 ? (
          <div className="space-y-4">
            {workoutPlans.map((plan) => (
              <div key={plan._id} className="border p-4 rounded-lg">
                <p className="text-gray-700">Gym: {plan.gym.name}</p>
                <p className="text-gray-700">Trainer: {plan.trainer.name}</p>
                <p className="text-gray-700">Plan: {plan.plan}</p>
                <p className="text-gray-700">
                  Start Date: {new Date(plan.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  End Date: {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No workout plans assigned yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Diet Plans</h2>
        {dietPlans.length > 0 ? (
          <div className="space-y-4">
            {dietPlans.map((plan) => (
              <div key={plan._id} className="border p-4 rounded-lg">
                <p className="text-gray-700">Gym: {plan.gym.name}</p>
                <p className="text-gray-700">Trainer: {plan.trainer.name}</p>
                <p className="text-gray-700">Plan: {plan.plan}</p>
                <p className="text-gray-700">
                  Start Date: {new Date(plan.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  End Date: {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No diet plans assigned yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Food Logs</h2>
        {foodLogs.length > 0 ? (
          <div className="space-y-4">
            {foodLogs.map((log) => (
              <div key={log._id} className="border p-4 rounded-lg">
                <p className="text-gray-700">Gym: {log.gym.name}</p>
                <p className="text-gray-700">
                  Date: {new Date(log.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">Meal: {log.meal}</p>
                <p className="text-gray-700">
                  Macros: Calories: {log.macros.calories}, Protein: {log.macros.protein}g, Carbs: {log.macros.carbs}g, Fats: {log.macros.fats}g
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No food logs yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Body Conditions</h2>
        {bodyConditions.length > 0 ? (
          <div className="space-y-4">
            {bodyConditions.map((condition) => (
              <div key={condition._id} className="border p-4 rounded-lg">
                <p className="text-gray-700">Gym: {condition.gym.name}</p>
                <p className="text-gray-700">
                  Date: {new Date(condition.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">Weight: {condition.weight} kg</p>
                <p className="text-gray-700">
                  Body Fat: {condition.bodyFat ? `${condition.bodyFat}%` : 'N/A'}
                </p>
                <p className="text-gray-700">
                  Muscle Mass: {condition.muscleMass ? `${condition.muscleMass} kg` : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No body condition logs yet.</p>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;