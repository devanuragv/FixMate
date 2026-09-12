import { db } from "../firebase/firebaseAdmin.js";


// ================================
// Get Profile
// ================================
export const getProfile = async (req, res) => {

  try {

    const userId =
      req.user.userId;


    const doc =
      await db
        .collection("users")
        .doc(userId)
        .get();


    if (!doc.exists) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }


    const user =
      doc.data();


    /*
     * Never send password
     * to the frontend.
     */

    delete user.password;


    res.status(200).json({

      success: true,

      user

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ================================
// Update Profile
// ================================
export const updateProfile = async (req, res) => {

  try {

    console.log(req.user);


    const userId =
      req.user.userId;


    const {

      name,
      phone,

      city,
      state,
      pincode,

      location

    } = req.body;


    await db
      .collection("users")
      .doc(userId)
      .update({

        name,

        phone,

        city,

        state,

        pincode,

        location,

        updatedAt:
          new Date()

      });


    res.status(200).json({

      success: true,

      message:
        "Profile Updated Successfully"

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};