import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';

interface AdminCertificate {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt: string | null;
}

@Component({
  selector: 'app-admin-certificates',
  imports: [RouterLink],
  templateUrl: './admin-certificates.html',
  styleUrl: './admin-certificates.css'
})
export class AdminCertificates {

  certificates = signal<AdminCertificate[]>([]);

  loading = signal(true);

  processingId = signal<string | null>(null);

  filter = signal<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');


  constructor(
    private supabaseService: Supabase
  ) {
    this.loadCertificates();
  }


  // =========================================
  // LOAD CERTIFICATES FROM SUPABASE
  // =========================================

  async loadCertificates() {

    this.loading.set(true);

    try {

      const client =
        this.supabaseService.getClient();


      // ---------------------------------------
      // GET CERTIFICATES
      // ---------------------------------------

      const {
        data: certificateData,
        error: certificateError
      } = await client
        .from('certificates')
        .select(`
          id,
          student_id,
          course_name,
          status,
          requested_at,
          approved_at
        `)
        .order(
          'requested_at',
          {
            ascending: false
          }
        );


      if (certificateError) {

        console.error(
          'Certificates loading error:',
          certificateError
        );

        this.certificates.set([]);

        return;
      }


      // ---------------------------------------
      // GET STUDENTS
      // ---------------------------------------

      const {
        data: studentsData,
        error: studentsError
      } = await client
        .from('students')
        .select(`
          id,
          full_name,
          email
        `);


      if (studentsError) {

        console.error(
          'Students loading error:',
          studentsError
        );

        this.certificates.set([]);

        return;
      }


      const certificates =
        certificateData || [];

      const students =
        studentsData || [];


      // ---------------------------------------
      // COMBINE DATA
      // ---------------------------------------

      const finalList: AdminCertificate[] =
        certificates.map(
          certificate => {

            const student =
              students.find(
                student =>
                  student.id ===
                  certificate.student_id
              );


            return {

              id:
                certificate.id,

              studentId:
                certificate.student_id,

              studentName:
                student?.full_name ||
                'Unknown Student',

              email:
                student?.email ||
                '-',

              course:
                certificate.course_name,

              status:
                certificate.status as
                'pending' |
                'approved' |
                'rejected',

              requestedAt:
                certificate.requested_at,

              approvedAt:
                certificate.approved_at

            };

          }
        );


      this.certificates.set(
        finalList
      );


      console.log(
        'Admin Certificates:',
        finalList
      );


    } catch (error) {

      console.error(
        'Admin certificates exception:',
        error
      );

      this.certificates.set([]);

    } finally {

      this.loading.set(false);

    }

  }


  // =========================================
  // FILTER
  // =========================================

  setFilter(
    filter:
      'all' |
      'pending' |
      'approved' |
      'rejected'
  ) {

    this.filter.set(filter);

  }


  get filteredCertificates() {

    const currentFilter =
      this.filter();

    const list =
      this.certificates();


    if (currentFilter === 'all') {

      return list;

    }


    return list.filter(
      certificate =>
        certificate.status ===
        currentFilter
    );

  }


  // =========================================
  // TOTAL COUNT
  // =========================================

  get totalCount() {

    return this.certificates()
      .length;

  }


  // =========================================
  // PENDING COUNT
  // =========================================

  get pendingCount() {

    return this.certificates()
      .filter(
        certificate =>
          certificate.status ===
          'pending'
      )
      .length;

  }


  // =========================================
  // APPROVED COUNT
  // =========================================

  get approvedCount() {

    return this.certificates()
      .filter(
        certificate =>
          certificate.status ===
          'approved'
      )
      .length;

  }


  // =========================================
  // REJECTED COUNT
  // =========================================

  get rejectedCount() {

    return this.certificates()
      .filter(
        certificate =>
          certificate.status ===
          'rejected'
      )
      .length;

  }


  // =========================================
  // APPROVE CERTIFICATE
  // =========================================

  async approveCertificate(
    certificate: AdminCertificate
  ) {

    if (
      this.processingId() !== null
    ) {
      return;
    }


    const confirmed =
      confirm(
        `Approve certificate for ${certificate.studentName}?`
      );


    if (!confirmed) {

      return;

    }


    this.processingId.set(
      certificate.id
    );


    try {

      const client =
        this.supabaseService.getClient();


      const {
        error
      } = await client
        .from('certificates')
        .update({

          status:
            'approved',

          approved_at:
            new Date().toISOString()

        })
        .eq(
          'id',
          certificate.id
        );


      if (error) {

        console.error(
          'Certificate approval error:',
          error
        );

        alert(
          'Certificate approve nahi hoya.'
        );

        return;

      }


      alert(
        'Certificate approved successfully! 🏆'
      );


      // Refresh from Supabase

      await this.loadCertificates();


    } catch (error) {

      console.error(
        'Approval exception:',
        error
      );

      alert(
        'Certificate approve nahi hoya.'
      );


    } finally {

      this.processingId.set(
        null
      );

    }

  }


  // =========================================
  // REJECT CERTIFICATE
  // =========================================

  async rejectCertificate(
    certificate: AdminCertificate
  ) {

    if (
      this.processingId() !== null
    ) {
      return;
    }


    const confirmed =
      confirm(
        `Reject certificate request from ${certificate.studentName}?`
      );


    if (!confirmed) {

      return;

    }


    this.processingId.set(
      certificate.id
    );


    try {

      const client =
        this.supabaseService.getClient();


      const {
        error
      } = await client
        .from('certificates')
        .update({

          status:
            'rejected',

          approved_at:
            null

        })
        .eq(
          'id',
          certificate.id
        );


      if (error) {

        console.error(
          'Certificate rejection error:',
          error
        );

        alert(
          'Certificate reject nahi hoya.'
        );

        return;

      }


      alert(
        'Certificate request rejected.'
      );


      // Refresh from Supabase

      await this.loadCertificates();


    } catch (error) {

      console.error(
        'Rejection exception:',
        error
      );

      alert(
        'Certificate reject nahi hoya.'
      );


    } finally {

      this.processingId.set(
        null
      );

    }

  }


  // =========================================
  // DATE FORMAT
  // =========================================

  formatDate(
    date: string | null
  ): string {

    if (!date) {

      return '-';

    }


    return new Date(date)
      .toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );

  }


  // =========================================
  // STATUS TEXT
  // =========================================

  getStatusText(
    status: string
  ): string {

    if (status === 'pending') {

      return 'Pending';

    }

    if (status === 'approved') {

      return 'Approved';

    }

    if (status === 'rejected') {

      return 'Rejected';

    }

    return status;

  }

}