package com.expenses.expense.repository;

import com.expenses.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    @Query("""
            select coalesce(sum(e.amount), 0)
            from Expense e
            where e.userId = :userId
              and lower(e.category) = lower(:category)
              and e.expenseDate between :from and :to
            """)
    BigDecimal sumForCategoryBetween(@Param("userId") Long userId,
                                     @Param("category") String category,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to);

    @Query("""
            select coalesce(sum(e.amount), 0)
            from Expense e
            where e.userId = :userId
              and e.expenseDate between :from and :to
            """)
    BigDecimal sumForUserBetween(@Param("userId") Long userId,
                                 @Param("from") LocalDate from,
                                 @Param("to") LocalDate to);
}
